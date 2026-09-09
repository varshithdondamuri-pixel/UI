import { CanvasNode } from '../../types';

/** First descendant whose semanticLabel matches `role` exactly (optionally also matching `kind`, to
 *  disambiguate roles a container and one of its own children share, e.g. 'nav-cta' on both the
 *  button rect and its label). */
function findByRole(children: CanvasNode[], role: string, kind?: CanvasNode['kind']): CanvasNode | undefined {
  return children.find((c) => c.metadata?.semanticLabel === role && (!kind || c.kind === kind));
}

function findAllByRole(children: CanvasNode[], role: string, kind?: CanvasNode['kind']): CanvasNode[] {
  return children.filter((c) => c.metadata?.semanticLabel === role && (!kind || c.kind === kind));
}

export class SemanticComponentRenderer {
  /**
   * Main entry point to render a CanvasNode as a rich, realistic semantic UI component.
   * `children` is every descendant of `node` (flattened, not just direct children) — real
   * generated content (brand text, headings, prices, ...) lives there, since `node` itself is
   * usually a structural container with no `.text` of its own.
   */
  public renderSemanticNode(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[] = []): boolean {
    const role = (node.metadata?.semanticLabel || node.metadata?.userLabel || '').toLowerCase();

    if (role.includes('navbar') || role.includes('header')) {
      this.renderNavbar(ctx, node, children);
      return true;
    }

    if (role.includes('hero')) {
      this.renderHero(ctx, node, children);
      return true;
    }

    if (role.includes('product card') || role.includes('product')) {
      this.renderProductCard(ctx, node, children);
      return true;
    }

    if (role.includes('metric card') || role.includes('revenue') || role.includes('users')) {
      this.renderMetricCard(ctx, node);
      return true;
    }

    if (role.includes('chart')) {
      this.renderChartPanel(ctx, node, children);
      return true;
    }

    if (role.includes('login') || role.includes('auth') || role.includes('form')) {
      this.renderAuthFormCard(ctx, node, children);
      return true;
    }

    if (role.includes('pricing')) {
      this.renderPricingCard(ctx, node);
      return true;
    }

    if (role.includes('feature card')) {
      this.renderFeatureCard(ctx, node, children);
      return true;
    }

    if (role.includes('sidebar')) {
      this.renderSidebarNav(ctx, node, children);
      return true;
    }

    // Default fallback to clean styled container
    this.renderGenericStyledCard(ctx, node);
    return true;
  }

  // 1. NAVBAR / STORE HEADER RENDERER
  private renderNavbar(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : '#0f172a';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : '#38bdf8';
    const strokeWidth = node.strokeWidth || 1.5;

    const brandText = node.text || findByRole(children, 'brand-logo')?.text || '⚡ NEXUS STORE';
    const navLinks = findAllByRole(children, 'nav-link').map((c) => c.text).filter((t): t is string => !!t);
    const linksText = navLinks.length > 0 ? navLinks.join('    ') : 'New Arrivals    Categories    Deals    Support';
    const ctaText = findByRole(children, 'nav-cta', 'text')?.text || 'Cart (3)';

    ctx.save();
    // Glassmorphic background
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();

    // Brand Logo Text
    ctx.fillStyle = stroke;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(brandText, x + 24, y + height / 2 + 6);

    // Search Input Bar
    const searchX = x + 260;
    const searchY = y + (height - 38) / 2;
    const searchW = Math.min(380, width - 600);
    if (searchW > 120) {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, searchX, searchY, searchW, 38, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('🔍 Search products, categories...', searchX + 14, searchY + 24);
    }

    // Navigation Links
    const linksX = searchX + searchW + 30;
    if (width > 900) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 13px Inter, sans-serif';
      ctx.fillText(linksText, linksX, y + height / 2 + 5);
    }

    // Cart & Account Badges
    const cartX = x + width - 150;
    const cartY = y + (height - 38) / 2;
    ctx.fillStyle = '#0ea5e9';
    this.drawRoundedRect(ctx, cartX, cartY, 120, 38, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`🛒 ${ctaText}`, cartX + 28, cartY + 24);

    ctx.restore();
  }

  // 2. HERO SECTION RENDERER
  private renderHero(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const hasNodeFill = node.fill && node.fill !== 'transparent';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : 'rgba(56, 189, 248, 0.4)';
    const strokeWidth = node.strokeWidth || 2;

    const heading = node.text || findByRole(children, 'hero-heading')?.text || 'Next-Gen Wireless Experience';
    const subheading = findByRole(children, 'hero-subheading')?.text || 'Immersive acoustic clarity with active noise cancellation.';
    const ctaText = findByRole(children, 'hero-cta', 'text')?.text || 'Shop Now →';

    ctx.save();
    // Background: the node's own fill when it has one, else the original
    // two-stop hardcoded gradient.
    if (hasNodeFill) {
      ctx.fillStyle = node.fill;
    } else {
      const grad = ctx.createLinearGradient(x, y, x + width, y + height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
    }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 16);
    ctx.fill();
    ctx.stroke();

    // Badge Pill
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    this.drawRoundedRect(ctx, x + 40, y + 36, 180, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('✨ NEW SEASON DROP', x + 54, y + 54);

    // Hero Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText(heading, x + 40, y + 110);

    // Hero Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(subheading, x + 40, y + 145);

    // CTA Buttons
    const btn1X = x + 40;
    const btnY = y + 180;
    ctx.fillStyle = '#0ea5e9';
    this.drawRoundedRect(ctx, btn1X, btnY, 150, 46, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(ctaText, btn1X + 32, btnY + 28);

    const btn2X = btn1X + 165;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.drawRoundedRect(ctx, btn2X, btnY, 140, 46, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillText('Learn More', btn2X + 34, btnY + 28);

    // Right Hero Product Media Graphic Card
    const mediaX = x + width - 360;
    const mediaY = y + 30;
    if (width > 700) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      this.drawRoundedRect(ctx, mediaX, mediaY, 320, height - 60, 14);
      ctx.fill();
      ctx.stroke();

      // Abstract Headphone SVG Graphic
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(mediaX + 160, mediaY + 120, 50, Math.PI, 0, false);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      this.drawRoundedRect(ctx, mediaX + 90, mediaY + 110, 30, 50, 8);
      ctx.fill();
      this.drawRoundedRect(ctx, mediaX + 200, mediaY + 110, 30, 50, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('Nexus Pro Wireless', mediaX + 95, mediaY + 195);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('$199.99', mediaX + 130, mediaY + 220);
    }

    ctx.restore();
  }

  // 3. ECOMMERCE PRODUCT CARD RENDERER
  private renderProductCard(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const label = node.metadata?.userLabel || 'Product Card';
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : '#0f172a';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : 'rgba(244, 114, 182, 0.35)';
    const strokeWidth = node.strokeWidth || 1.5;

    const realTitle = findByRole(children, 'product-card-title')?.text;
    const realPrice = findByRole(children, 'product-card-price')?.text;
    const realCta = findByRole(children, 'product-card-cta')?.text;

    ctx.save();
    // Card Background Container
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 14);
    ctx.fill();
    ctx.stroke();

    // Product Image Container Box
    const imgH = Math.max(100, height - 120);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    this.drawRoundedRect(ctx, x + 12, y + 12, width - 24, imgH, 10);
    ctx.fill();
    ctx.stroke();

    // Image Photo Graphic Placeholder
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 12 + imgH / 2, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('📦', x + width / 2 - 10, y + 12 + imgH / 2 + 6);

    // Product Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px Inter, sans-serif';
    const titleSource = realTitle || node.text || label;
    const title = titleSource.split('($')[0] || 'Premium Tech Accessory';
    ctx.fillText(title.slice(0, 32), x + 14, y + imgH + 32);

    // Star Rating
    ctx.fillStyle = '#facc15';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('★★★★☆ 4.8 (124)', x + 14, y + imgH + 52);

    // Price Tag
    const price = realPrice || (label.includes('($') ? `$${label.split('($')[1].replace(')', '')}` : '$149.99');
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(price, x + 14, y + imgH + 78);

    // Add to Cart Button
    const btnW = 105;
    const btnX = x + width - btnW - 14;
    const btnY = y + imgH + 56;
    ctx.fillStyle = '#0ea5e9';
    this.drawRoundedRect(ctx, btnX, btnY, btnW, 32, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`+ ${realCta || 'Add to Cart'}`, btnX + 16, btnY + 20);

    ctx.restore();
  }

  // 4. METRIC STAT CARD RENDERER
  private renderMetricCard(ctx: CanvasRenderingContext2D, node: CanvasNode): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const title = node.metadata?.userLabel || 'Metric Card';

    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    this.drawRoundedRect(ctx, x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillText(title.split('(')[0] || 'Metric', x + 16, y + 28);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px Inter, sans-serif';
    const val = title.includes('(') ? title.split('(')[1].replace(')', '') : '84,250';
    ctx.fillText(val, x + 16, y + 60);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('+14.2% ↑ vs last week', x + 16, y + 84);

    ctx.restore();
  }

  // 5. ANALYTICS CHART PANEL RENDERER
  private renderChartPanel(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : '#0f172a';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : '#38bdf8';
    const strokeWidth = node.strokeWidth || 1.5;
    const title = node.text || findByRole(children, 'chart-title')?.text || '📊 Revenue & Traffic Analytics';

    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(title, x + 20, y + 34);

    // Draw Chart Curve / Bar Series
    const chartY = y + 70;
    const chartH = height - 100;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 4; i++) {
      const lineY = chartY + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x + 20, lineY);
      ctx.lineTo(x + width - 20, lineY);
      ctx.stroke();
    }

    // Trend Curve Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const pts = [
      { cx: x + 40, cy: chartY + chartH - 20 },
      { cx: x + width * 0.25, cy: chartY + chartH - 80 },
      { cx: x + width * 0.5, cy: chartY + chartH - 40 },
      { cx: x + width * 0.75, cy: chartY + chartH - 140 },
      { cx: x + width - 40, cy: chartY + chartH - 180 }
    ];
    ctx.moveTo(pts[0].cx, pts[0].cy);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].cx, pts[i].cy);
    }
    ctx.stroke();

    ctx.restore();
  }

  // 6. AUTH FORM CARD RENDERER
  private renderAuthFormCard(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : '#1e293b';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : '#38bdf8';
    const strokeWidth = node.strokeWidth || 2;
    const title = node.text || findByRole(children, 'login-title')?.text || '⚡ Welcome Back';

    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stroke;
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(title, x + 40, y + 55);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Sign in to your account to continue', x + 40, y + 85);

    ctx.restore();
  }

  // 7. PRICING CARD RENDERER
  private renderPricingCard(ctx: CanvasRenderingContext2D, node: CanvasNode): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const label = node.text || node.metadata?.userLabel || 'Pricing Tier';

    ctx.save();
    const isPro = label.includes('Pro');
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : (isPro ? '#1e1b4b' : '#1e293b');
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : (isPro ? '#6366f1' : 'rgba(255, 255, 255, 0.15)');
    const strokeWidth = node.strokeWidth || (isPro ? 2 : 1);
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isPro ? '#a855f7' : '#38bdf8';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(label, x + 24, y + 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    const price = label.includes('$') ? `$${label.split('$')[1].split(' ')[0]}` : '$49/mo';
    ctx.fillText(price, x + 24, y + 80);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('✔ Unlimited UI Generations', x + 24, y + 130);
    ctx.fillText('✔ Governed ML Models v2.0', x + 24, y + 160);
    ctx.fillText('✔ Export SVG & Vector Assets', x + 24, y + 190);

    const btnY = y + height - 70;
    ctx.fillStyle = isPro ? '#6366f1' : '#0ea5e9';
    this.drawRoundedRect(ctx, x + 24, btnY, width - 48, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('Subscribe Plan', x + width / 2 - 45, btnY + 27);

    ctx.restore();
  }

  // 8. FEATURE CARD RENDERER
  private renderFeatureCard(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const label = findByRole(children, 'feature-title')?.text || node.text || node.metadata?.userLabel || 'Feature Card';
    const description = findByRole(children, 'feature-description')?.text || 'Automated UI vector recognition and design synthesis.';
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : '#1e293b';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : 'rgba(255, 255, 255, 0.1)';
    const strokeWidth = node.strokeWidth || 1;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('⚡', x + 20, y + 40);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(label, x + 20, y + 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(description, x + 20, y + 100);

    ctx.restore();
  }

  // 9. SIDEBAR NAVIGATION RENDERER
  private renderSidebarNav(ctx: CanvasRenderingContext2D, node: CanvasNode, children: CanvasNode[]): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const fill = node.fill && node.fill !== 'transparent' ? node.fill : '#0f172a';
    const stroke = node.stroke && node.stroke !== 'transparent' ? node.stroke : '#38bdf8';
    const strokeWidth = node.strokeWidth || 1.5;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    this.drawRoundedRect(ctx, x, y, width, height, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stroke;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(node.text || '⚡ APP WORKSPACE', x + 20, y + 45);

    const realItems = findAllByRole(children, 'sidebar-item').map((c) => c.text).filter((t): t is string => !!t);
    const items = realItems.length > 0 ? realItems : ['📊 Dashboard', '🎨 UI Builder', '🖼️ Templates', '📊 Analytics', '⚙️ Settings'];
    items.forEach((item, idx) => {
      const itemY = y + 90 + idx * 45;
      if (idx === 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        this.drawRoundedRect(ctx, x + 12, itemY - 20, width - 24, 34, 6);
        ctx.fill();
      }
      ctx.fillStyle = idx === 0 ? '#38bdf8' : '#94a3b8';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillText(item, x + 24, itemY);
    });

    ctx.restore();
  }

  // 10. GENERIC STYLED CARD FALLBACK
  private renderGenericStyledCard(ctx: CanvasRenderingContext2D, node: CanvasNode): void {
    const { x, y } = node.position;
    const { width, height } = node.size;
    const label = node.metadata?.userLabel || node.metadata?.semanticLabel || 'UI Component';

    ctx.save();
    ctx.fillStyle = node.fill !== 'transparent' ? node.fill : '#1e293b';
    ctx.strokeStyle = node.stroke || '#38bdf8';
    ctx.lineWidth = node.strokeWidth || 1;
    this.drawRoundedRect(ctx, x, y, width, height, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(label, x + 12, y + 24);

    ctx.restore();
  }

  // Helper function to draw rounded rectangles on Canvas Context 2D
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
