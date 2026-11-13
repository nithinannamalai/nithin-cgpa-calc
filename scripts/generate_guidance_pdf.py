import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_guidance_pdf(filename="public/calculation-guidance.pdf"):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # 0.4 in (28.8 pt) margins to allow all 4 sections to fit comfortably
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=28,
        rightMargin=28,
        topMargin=26,
        bottomMargin=26
    )

    styles = getSampleStyleSheet()
    
    # Palette
    PRIMARY = colors.HexColor("#0f172a")     # Dark Slate
    ACCENT = colors.HexColor("#d97706")      # Amber
    SECONDARY = colors.HexColor("#0369a1")   # Deep Blue
    BG_CARD = colors.HexColor("#f8fafc")     # Clean card bg
    BORDER_COL = colors.HexColor("#cbd5e1")  # Slate border
    TEXT_MUTED = colors.HexColor("#64748b")  # Muted grey
    TEXT_DARK = colors.HexColor("#1e293b")   # Body text

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=20,
        textColor=PRIMARY,
        spaceAfter=1
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MUTED,
        spaceAfter=6
    )

    h1_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=PRIMARY,
        spaceBefore=0,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.8,
        textColor=TEXT_DARK
    )

    formula_title = ParagraphStyle(
        'FormulaTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=ACCENT
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.2,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.2,
        textColor=PRIMARY
    )

    elements = []

    # --- Header ---
    elements.append(Paragraph("<b>CalCGPA</b> — Calculation Guidance", title_style))
    elements.append(Paragraph("Input entry explanations & concise formulas for all sections &bull; Developed by <b>R.Nithin Annamalai</b>", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.2, color=ACCENT, spaceBefore=0, spaceAfter=6))

    # --- 1. Semester GPA ---
    elements.append(Paragraph("1. Semester GPA (Grade Point Average)", h1_style))
    
    gpa_desc = Paragraph(
        "<b>Input Entries:</b><br/>"
        "&bull; <b>Course Name:</b> Title / code of the subject.<br/>"
        "&bull; <b>Credits:</b> Subject credit weight (e.g. 1, 2, 3, 4).<br/>"
        "&bull; <b>Grade:</b> Letter grade received (O to U).<br/><br/>"
        "<b>Formula:</b><br/>"
        "<b>GPA = &Sigma; (Credits<sub>i</sub> &times; GradePoints<sub>i</sub>) / &Sigma; Credits<sub>i</sub></b><br/>"
        "<font color='#64748b'>Total Points = sum of (Credits &times; Points for each course)<br/>"
        "Total Credits = sum of all course credits</font>",
        body_style
    )

    # Full Grade table with separate B (56-60) and C (50-55) rows
    grade_data = [
        [Paragraph("Grade", table_header), Paragraph("Mark Range", table_header), Paragraph("Points", table_header), Paragraph("Rating", table_header)],
        [Paragraph("O", table_cell_bold), Paragraph("91 – 100", table_cell), Paragraph("10", table_cell_bold), Paragraph("Outstanding", table_cell)],
        [Paragraph("A+", table_cell_bold), Paragraph("81 – 90", table_cell), Paragraph("9", table_cell_bold), Paragraph("Excellent", table_cell)],
        [Paragraph("A", table_cell_bold), Paragraph("71 – 80", table_cell), Paragraph("8", table_cell_bold), Paragraph("Very Good", table_cell)],
        [Paragraph("B+", table_cell_bold), Paragraph("61 – 70", table_cell), Paragraph("7", table_cell_bold), Paragraph("Good", table_cell)],
        [Paragraph("B", table_cell_bold), Paragraph("56 – 60", table_cell), Paragraph("6", table_cell_bold), Paragraph("Above Average", table_cell)],
        [Paragraph("C", table_cell_bold), Paragraph("50 – 55", table_cell), Paragraph("5", table_cell_bold), Paragraph("Average", table_cell)],
        [Paragraph("U", table_cell_bold), Paragraph("&lt; 50", table_cell), Paragraph("0", table_cell_bold), Paragraph("Re-appear / Fail", table_cell)],
    ]
    t_grade = Table(grade_data, colWidths=[36, 60, 36, 88])
    t_grade.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_CARD])
    ]))

    sec1_table = Table([[gpa_desc, t_grade]], colWidths=[330, 225])
    sec1_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), BG_CARD),
        ('BOX', (0,0), (0,0), 0.8, BORDER_COL),
        ('PADDING', (0,0), (0,0), 5),
    ]))
    elements.append(sec1_table)
    elements.append(Spacer(1, 6))

    # --- 2. Overall CGPA ---
    elements.append(Paragraph("2. Overall CGPA (Cumulative Grade Point Average)", h1_style))
    cgpa_data = [
        [
            Paragraph("<b>Mode A: GPA Only (Simple Average)</b>", formula_title),
            Paragraph("<b>Mode B: Credit-Weighted CGPA (Official)</b>", formula_title)
        ],
        [
            Paragraph(
                "<b>Input Entries:</b><br/>"
                "&bull; <b>Semester GPAs:</b> Enter GPA values separated by comma or newline (e.g. 8.5, 9.2, 7.8).<br/><br/>"
                "<b>Formula:</b><br/>"
                "<b>CGPA = (&Sigma; GPA<sub>i</sub>) / N</b><br/>"
                "<font color='#64748b'>Where N = number of semesters entered.</font>",
                body_style
            ),
            Paragraph(
                "<b>Input Entries:</b><br/>"
                "&bull; <b>GPA &amp; Credits:</b> Enter semester GPA and total credits registered for each semester row.<br/><br/>"
                "<b>Formula:</b><br/>"
                "<b>CGPA = &Sigma; (GPA<sub>i</sub> &times; Credits<sub>i</sub>) / &Sigma; Credits<sub>i</sub></b><br/>"
                "<font color='#64748b'>Weights semesters by their respective credit counts.</font>",
                body_style
            )
        ]
    ]
    t_cgpa = Table(cgpa_data, colWidths=[277, 277])
    t_cgpa.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), BG_CARD),
        ('BOX', (0,0), (0,-1), 0.8, BORDER_COL),
        ('BOX', (1,0), (1,-1), 0.8, BORDER_COL),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_cgpa)
    elements.append(Spacer(1, 6))

    # --- 3. Required GPA ---
    elements.append(Paragraph("3. Required GPA (Target CGPA Planner)", h1_style))
    req_data = [
        [
            Paragraph("<b>Mode 1: Semester-Count Estimation</b>", formula_title),
            Paragraph("<b>Mode 2: Credit-Weighted (Accurate)</b>", formula_title)
        ],
        [
            Paragraph(
                "<b>Input Entries:</b><br/>"
                "&bull; <b>Current CGPA:</b> Cumulative GPA earned so far.<br/>"
                "&bull; <b>Target CGPA:</b> Desired cumulative CGPA goal.<br/>"
                "&bull; <b>Semesters Completed (N):</b> Number of terms finished.<br/><br/>"
                "<b>Formula:</b><br/>"
                "<b>Required GPA = Target &times; (N + 1) &minus; Current &times; N</b>",
                body_style
            ),
            Paragraph(
                "<b>Input Entries:</b><br/>"
                "&bull; <b>Current CGPA:</b> Existing cumulative GPA.<br/>"
                "&bull; <b>Target CGPA:</b> Desired overall CGPA goal.<br/>"
                "&bull; <b>Completed Credits (C<sub>prev</sub>):</b> Total credits earned so far.<br/>"
                "&bull; <b>Upcoming Credits (C<sub>next</sub>):</b> Credits in the upcoming term.<br/><br/>"
                "<b>Formula:</b><br/>"
                "<b>Required GPA = [Target &times; (C<sub>prev</sub> + C<sub>next</sub>) &minus; Current &times; C<sub>prev</sub>] / C<sub>next</sub></b>",
                body_style
            )
        ]
    ]
    t_req = Table(req_data, colWidths=[277, 277])
    t_req.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), BG_CARD),
        ('BOX', (0,0), (0,-1), 0.8, BORDER_COL),
        ('BOX', (1,0), (1,-1), 0.8, BORDER_COL),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_req)
    elements.append(Spacer(1, 6))

    # --- 4. End Semester Marks ---
    elements.append(Paragraph("4. End Semester Marks & Grading", h1_style))
    marks_data = [
        [
            Paragraph("<b>Assessment Input Entries &amp; Total Formula</b>", formula_title),
            Paragraph("<b>Target End Sem Goal Formula</b>", formula_title)
        ],
        [
            Paragraph(
                "<b>Input Entries:</b><br/>"
                "&bull; <b>Split Mode (40:60):</b> Internal Test 1 (/50), Internal Test 2 (/50), Term Work (/10), End Sem Exam (/100).<br/>"
                "&bull; <b>Total Mode:</b> Total Internals (/40 or /50), End Sem Exam (/100).<br/><br/>"
                "<b>Total Marks (/100) Formula:</b><br/>"
                "&bull; <b>Split Mode:</b> (Test 1 &times; 0.3) + (Test 2 &times; 0.3) + Term Work + (End Sem &times; 0.6)<br/>"
                "&bull; <b>Total /40 Mode:</b> Internals (/40) + (End Sem &times; 0.6)<br/>"
                "&bull; <b>Total /50 Mode:</b> Internals (/50) + (End Sem &times; 0.5)",
                body_style
            ),
            Paragraph(
                "<b>Input Entry:</b><br/>"
                "&bull; <b>Want a total of?:</b> Desired final score out of 100.<br/><br/>"
                "<b>Required End Sem Exam Score (/100) Formula:</b><br/>"
                "<b>Needed End Sem = (Target Total &minus; Internals) / Factor</b><br/><br/>"
                "<font color='#64748b'>&bull; <b>Factor = 0.6</b> for 40:60 assessment mode<br/>"
                "&bull; <b>Factor = 0.5</b> for 50:50 assessment mode</font>",
                body_style
            )
        ]
    ]
    t_marks = Table(marks_data, colWidths=[297, 257])
    t_marks.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (-1,-1), BG_CARD),
        ('BOX', (0,0), (0,-1), 0.8, BORDER_COL),
        ('BOX', (1,0), (1,-1), 0.8, BORDER_COL),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_marks)
    elements.append(Spacer(1, 6))

    # Footer
    elements.append(HRFlowable(width="100%", thickness=0.6, color=BORDER_COL, spaceBefore=2, spaceAfter=4))
    elements.append(Paragraph(
        "<font color='#64748b'>CalCGPA &bull; Developed by <b>R.Nithin Annamalai</b> &bull; Reference Document for Academic GPA / CGPA / Marks Calculations</font>",
        ParagraphStyle('FooterText', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=1)
    ))

    doc.build(elements)
    print(f"PDF successfully generated at: {filename}")

if __name__ == "__main__":
    create_guidance_pdf()
