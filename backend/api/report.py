from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import math
from datetime import datetime

router = APIRouter()

# ─── Color palette ──────────────────────────────────────────────────────────────
BRAND = HexColor("#13b88e")
BRAND_DARK = HexColor("#0a9374")
BG_DARK = HexColor("#0d1117")
BG_CARD = HexColor("#161b22")
TEXT_PRIMARY = HexColor("#e6edf3")
TEXT_SECONDARY = HexColor("#8b949e")
TEXT_DIM = HexColor("#484f58")
AMBER = HexColor("#f59e0b")
BLUE = HexColor("#3b82f6")
PURPLE = HexColor("#8b5cf6")
PINK = HexColor("#ec4899")
CYAN = HexColor("#06b6d4")
RED = HexColor("#ef4444")
GREEN = HexColor("#22c55e")
WHITE = HexColor("#ffffff")
BLACK = HexColor("#000000")

DIM_COLORS = {
    "emergency": AMBER,
    "insurance": BLUE,
    "investments": PURPLE,
    "debt": PINK,
    "tax": CYAN,
    "retirement": BRAND,
}
DIM_LABELS = {
    "emergency": "Emergency Fund",
    "insurance": "Insurance Cover",
    "investments": "Investments",
    "debt": "Debt Health",
    "tax": "Tax Efficiency",
    "retirement": "Retirement Readiness",
}

DISCLAIMER_TEXT = (
    "DISCLAIMER: This report is AI-generated for educational and informational purposes only. "
    "SmartSaathiAI is not a SEBI-registered investment advisor. The information herein does not "
    "constitute financial advice. Past returns do not guarantee future performance. Investments "
    "are subject to market risks. Please consult a SEBI-registered financial advisor before "
    "making any investment decisions. SmartSaathiAI bears no liability for decisions made based "
    "on this report."
)


def _add_watermark(c, width, height):
    """Draws a diagonal transparent watermark on each page."""
    c.saveState()
    c.setFont("Helvetica-Bold", 52)
    c.setFillColor(Color(0.3, 0.3, 0.3, alpha=0.06))
    c.translate(width / 2, height / 2)
    c.rotate(35)
    c.drawCentredString(0, 0, "SmartSaathiAI")
    c.restoreState()

    # Second smaller watermark
    c.saveState()
    c.setFont("Helvetica", 28)
    c.setFillColor(Color(0.3, 0.3, 0.3, alpha=0.04))
    c.translate(width / 2, height / 4)
    c.rotate(35)
    c.drawCentredString(0, 0, "AI-Generated Report")
    c.restoreState()


def _add_disclaimer(c, width, y_pos):
    """Draws the disclaimer at the bottom of the page."""
    c.saveState()
    c.setFont("Helvetica", 5.5)
    c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.8))

    # Disclaimer box
    box_y = 12 * mm
    box_h = 18 * mm
    c.setStrokeColor(Color(0.4, 0.4, 0.4, alpha=0.3))
    c.setLineWidth(0.3)
    c.rect(15 * mm, box_y, width - 30 * mm, box_h, stroke=1, fill=0)

    # Disclaimer header
    c.setFont("Helvetica-Bold", 6)
    c.drawString(18 * mm, box_y + box_h - 4 * mm, "⚠ IMPORTANT DISCLAIMER")

    # Disclaimer text — word wrap manually
    c.setFont("Helvetica", 5.2)
    words = DISCLAIMER_TEXT.split(" ")
    lines = []
    current = ""
    max_w = width - 36 * mm
    for word in words:
        test = f"{current} {word}".strip()
        if c.stringWidth(test, "Helvetica", 5.2) < max_w:
            current = test
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)

    y = box_y + box_h - 8 * mm
    for line in lines[:4]:
        c.drawString(18 * mm, y, line)
        y -= 3 * mm

    c.restoreState()


def _draw_rounded_rect(c, x, y, w, h, r, fill_color=None, stroke_color=None):
    """Draw a rounded rectangle."""
    c.saveState()
    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(0.5)
    p = c.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.arcTo(x + w - r, y, x + w, y + r, r)
    p.lineTo(x + w, y + h - r)
    p.arcTo(x + w, y + h - r, x + w - r, y + h, r)
    p.lineTo(x + r, y + h)
    p.arcTo(x + r, y + h, x, y + h - r, r)
    p.lineTo(x, y + r)
    p.arcTo(x, y + r, x + r, y, r)
    p.close()
    if fill_color and stroke_color:
        c.drawPath(p, fill=1, stroke=1)
    elif fill_color:
        c.drawPath(p, fill=1, stroke=0)
    elif stroke_color:
        c.drawPath(p, fill=0, stroke=1)
    c.restoreState()


def _draw_score_ring(c, cx, cy, radius, score, tier_color, tier):
    """Draws a circular score ring."""
    color = HexColor(tier_color) if isinstance(tier_color, str) else tier_color

    # Background circle
    c.saveState()
    c.setStrokeColor(Color(0.3, 0.3, 0.3, alpha=0.3))
    c.setLineWidth(8)
    c.circle(cx, cy, radius, stroke=1, fill=0)
    c.restoreState()

    # Score arc
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(8)
    c.setLineCap(1)
    angle = score / 100 * 360
    start_angle = 90  # start from top
    c.arc(
        cx - radius, cy - radius,
        cx + radius, cy + radius,
        startAng=start_angle,
        extent=angle,
    )
    c.restoreState()

    # Score text in center
    c.saveState()
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(color)
    c.drawCentredString(cx, cy + 4, str(score))
    c.setFont("Helvetica", 9)
    c.setFillColor(Color(0.55, 0.55, 0.55, alpha=0.8))
    c.drawCentredString(cx, cy - 12, "out of 100")
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(color)
    c.drawCentredString(cx, cy - 26, tier)
    c.restoreState()


def _draw_dimension_bar(c, x, y, width, label, value, color, max_val=100):
    """Draws a single dimension bar with label and value."""
    bar_h = 6
    fill_w = (value / max_val) * width

    # Label
    c.saveState()
    c.setFont("Helvetica", 8)
    c.setFillColor(Color(0.55, 0.58, 0.62, alpha=1))
    c.drawString(x, y + bar_h + 4, label)

    # Value
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(color)
    c.drawRightString(x + width, y + bar_h + 4, f"{value}/100")

    # Background bar
    c.setFillColor(Color(0.2, 0.2, 0.2, alpha=0.5))
    _draw_rounded_rect(c, x, y, width, bar_h, 3, fill_color=Color(0.2, 0.2, 0.2, alpha=0.5))

    # Filled bar
    if fill_w > 6:
        _draw_rounded_rect(c, x, y, fill_w, bar_h, 3, fill_color=color)

    c.restoreState()


class BMSReportRequest(BaseModel):
    score: dict  # {total, tier, tier_color, dimensions}
    advice: list[str] = []
    ai_summary: str = ""
    govt_schemes: list[dict] = []
    user_age: int = 30
    user_income: float = 0


@router.post("/report/bms")
async def generate_bms_pdf(req: BMSReportRequest):
    """Generate a beautiful BMS score PDF report with watermark and disclaimer."""
    try:
        buf = BytesIO()
        width, height = A4
        c = canvas.Canvas(buf, pagesize=A4)

        # ─── Page 1: Score Overview ──────────────────────────────────────
        _add_watermark(c, width, height)

        # Header gradient bar
        c.saveState()
        c.setFillColor(BRAND_DARK)
        c.rect(0, height - 28 * mm, width, 28 * mm, fill=1, stroke=0)

        # Logo text
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(WHITE)
        c.drawString(20 * mm, height - 15 * mm, "SmartSaathiAI")
        c.setFont("Helvetica", 9)
        c.setFillColor(Color(1, 1, 1, alpha=0.7))
        c.drawString(20 * mm, height - 21 * mm, "India's AI-Powered Financial Mentor")

        # Date
        c.setFont("Helvetica", 8)
        c.drawRightString(width - 20 * mm, height - 15 * mm, f"Report Generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}")
        c.drawRightString(width - 20 * mm, height - 21 * mm, "ET GenAI Hackathon 2026")
        c.restoreState()

        # Title section
        y = height - 42 * mm
        c.setFont("Helvetica-Bold", 20)
        c.setFillColor(HexColor("#1a1a2e"))
        c.drawCentredString(width / 2, y, "Bharat Money Score Report")

        y -= 6 * mm
        c.setFont("Helvetica", 10)
        c.setFillColor(HexColor("#555555"))
        c.drawCentredString(width / 2, y, "Your Complete Financial Health Analysis")

        # Score ring
        y -= 10 * mm
        ring_cy = y - 35
        _draw_score_ring(
            c, width / 2, ring_cy, 40,
            req.score.get("total", 0),
            req.score.get("tier_color", "#13b88e"),
            req.score.get("tier", ""),
        )

        # Dimension bars
        y = ring_cy - 60
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(HexColor("#1a1a2e"))
        c.drawString(25 * mm, y, "Score Breakdown")
        y -= 8 * mm

        dims = req.score.get("dimensions", {})
        bar_width = width - 50 * mm
        for key in ["emergency", "insurance", "investments", "debt", "tax", "retirement"]:
            val = dims.get(key, 0)
            color = DIM_COLORS.get(key, BRAND)
            label = DIM_LABELS.get(key, key.title())
            _draw_dimension_bar(c, 25 * mm, y, bar_width, label, val, color)
            y -= 22

        # AI Summary section
        if req.ai_summary:
            y -= 10
            c.saveState()
            # Summary box
            box_x = 20 * mm
            box_w = width - 40 * mm
            box_h = 35 * mm

            c.setFillColor(Color(0.93, 0.98, 0.96, alpha=1))
            c.setStrokeColor(BRAND)
            c.setLineWidth(1)
            c.roundRect(box_x, y - box_h + 10, box_w, box_h, 6, fill=1, stroke=1)

            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(BRAND_DARK)
            c.drawString(box_x + 5 * mm, y + 2, "🤖 SmartSaathi Says:")

            c.setFont("Helvetica", 8)
            c.setFillColor(HexColor("#333333"))
            # Word wrap AI summary
            words = req.ai_summary.split(" ")
            lines = []
            current = ""
            max_text_w = box_w - 10 * mm
            for word in words:
                test = f"{current} {word}".strip()
                if c.stringWidth(test, "Helvetica", 8) < max_text_w:
                    current = test
                else:
                    lines.append(current)
                    current = word
            if current:
                lines.append(current)

            text_y = y - 5
            for line in lines[:5]:
                c.drawString(box_x + 5 * mm, text_y, line)
                text_y -= 3.5 * mm
            c.restoreState()
            y = y - box_h - 2 * mm

        # Action Items
        if req.advice:
            y -= 5
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(HexColor("#1a1a2e"))
            c.drawString(25 * mm, y, "Action Items")
            y -= 6 * mm

            for i, advice_text in enumerate(req.advice[:5]):
                c.saveState()
                # Bullet
                c.setFont("Helvetica-Bold", 9)
                c.setFillColor(BRAND)
                c.drawString(25 * mm, y, f"→")
                # Text
                c.setFont("Helvetica", 8)
                c.setFillColor(HexColor("#444444"))
                # Truncate if too long
                max_w = width - 60 * mm
                text = advice_text
                if c.stringWidth(text, "Helvetica", 8) > max_w:
                    while c.stringWidth(text + "...", "Helvetica", 8) > max_w and len(text) > 10:
                        text = text[:-1]
                    text += "..."
                c.drawString(30 * mm, y, text)
                c.restoreState()
                y -= 5 * mm

        # Government Schemes
        if req.govt_schemes:
            y -= 8
            if y < 50 * mm:
                _add_disclaimer(c, width, 0)
                c.showPage()
                _add_watermark(c, width, height)
                y = height - 30 * mm

            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(HexColor("#1a1a2e"))
            c.drawString(25 * mm, y, "Government Schemes You Qualify For")
            y -= 8 * mm

            for scheme in req.govt_schemes[:5]:
                c.saveState()
                c.setFont("Helvetica-Bold", 8.5)
                c.setFillColor(BRAND_DARK)
                c.drawString(25 * mm, y, f"• {scheme.get('name', '')}")

                c.setFont("Helvetica", 7.5)
                c.setFillColor(HexColor("#555555"))
                desc = scheme.get("desc", "")
                max_w = width - 60 * mm
                if c.stringWidth(desc, "Helvetica", 7.5) > max_w:
                    while c.stringWidth(desc + "...", "Helvetica", 7.5) > max_w and len(desc) > 10:
                        desc = desc[:-1]
                    desc += "..."
                c.drawString(30 * mm, y - 4 * mm, desc)
                c.restoreState()
                y -= 12 * mm

        # Footer with disclaimer
        _add_disclaimer(c, width, 0)

        # Footer line
        c.saveState()
        c.setFont("Helvetica", 6)
        c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.6))
        c.drawCentredString(width / 2, 8 * mm, "SmartSaathiAI — ET GenAI Hackathon 2026 | Powered by Groq + Llama + FastAPI")
        c.restoreState()

        c.save()
        buf.seek(0)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        filename = f"SmartSaathiAI_BMS_Report_{timestamp}.pdf"

        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
