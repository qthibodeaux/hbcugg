from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent

def base(size=11):
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = sec.bottom_margin = Inches(0.6)
    sec.left_margin = sec.right_margin = Inches(0.7)
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    normal = doc.styles['Normal']
    normal.font.name = 'Calibri'
    normal.font.size = Pt(size)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.05
    for name, sz in [('Title', 22), ('Heading 1', 11)]:
        style = doc.styles[name]
        style.font.name = 'Calibri'
        style.font.size = Pt(sz)
        style.font.bold = True
        style.font.color.rgb = RGBColor(0, 0, 0)
        style.paragraph_format.space_before = Pt(8 if name == 'Heading 1' else 0)
        style.paragraph_format.space_after = Pt(4)
    doc.core_properties.author = 'Quintus Thibodeaux'
    doc.add_paragraph('Quintus Thibodeaux', 'Title')
    doc.add_paragraph('Houston, TX | 281-734-8561 | qthibgit@gmail.com')
    return doc

def role(doc, company, title, dates):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.keep_with_next = True
    p.add_run(company).bold = True
    p.add_run(' | ' + dates)
    p = doc.add_paragraph(title)
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_after = Pt(3)
    p.runs[0].italic = True

def bullet(doc, text):
    p = doc.add_paragraph(text, 'List Bullet')
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.05

doc = base()
doc.core_properties.title = 'Quintus Thibodeaux Resume for Ezee Fiber'
doc.add_paragraph('Professional Summary', 'Heading 1')
doc.add_paragraph('Experience coordinating customer orders from initial requirements through delivery and guiding clients through new system implementations. At YKK AP America, lead the team in order count and dollar volume and enter 95% of orders within two business days. Previously coordinated onboarding for optometry practices at Alcon and maintained 98% customer satisfaction in technical support at Glowforge.')
doc.add_paragraph('Professional Experience', 'Heading 1')
role(doc, 'YKK AP America', 'Customer Service Rep, Order Coordination', 'Feb 2024 to Present')
bullet(doc, 'Manage customer orders from drawing review and order entry through customer approval, production, shipment updates, and warranty documentation. Handle changes, corrections, invoices, and credits throughout the process.')
bullet(doc, 'Review architectural and engineering drawings to determine order specifications. Resolve questions with estimating and coordinate requirements and delivery updates with customers, construction project managers, warehouse staff, and sales.')
bullet(doc, 'Lead the team in order count and dollar volume, entering approximately 10 more orders per month than the next closest representative. Enter 95% of orders within two business days.')
bullet(doc, 'Moved a customer\'s delivery forward by approximately three weeks after an order error. Clarified what the customer needed and reworked the order around available inventory and production timelines.')
bullet(doc, 'Created templates for common quote revisions, reducing the time estimators spent reworking quotes and clarifying changes. Cut unnecessary shipping costs by changing how paint and finish samples were packaged.')
bullet(doc, 'Serve as an informal team lead and check coworkers\' orders before submission. Manage more than 50 emails and approximately 15 calls per day alongside order processing.')
role(doc, 'Glowforge', 'Technical Support', 'Jan 2023 to Feb 2024')
bullet(doc, 'Maintained 98% customer satisfaction while resolving equipment, software, firmware, and design file problems through phone, chat, and support tickets.')
bullet(doc, 'Investigated problems involving several causes, including file errors, machine maintenance, material setup, and heat damage. Explained each step in terms customers could understand.')
bullet(doc, 'Wrote troubleshooting guides and customer help articles. Helped document service level agreements and support workflows as the company developed its processes.')
doc.add_page_break()
doc.add_paragraph('Professional Experience Continued', 'Heading 1')
role(doc, 'Alcon', 'Implementation Consultant', 'May 2019 to Oct 2022')
bullet(doc, 'Guided optometry practices through implementations lasting several weeks, coordinating onboarding tasks, answering questions, and training clients on Alcon\'s Marlo system.')
bullet(doc, 'Shared the Texas client workload with one other implementation consultant, handling more than 14 client accounts or interactions each day.')
bullet(doc, 'Coordinated a rollout across four practice locations. Implemented the first two directly, then worked with their trained staff to help bring the remaining locations onto the new process.')
bullet(doc, 'Delivered live presentations for practice owners and office staff. Adjusted training to each person\'s responsibilities and involved the staff who would use the system daily.')
bullet(doc, 'Helped establish implementation procedures and service level agreements for a developing function. Used Salesforce, Jira, and Confluence to support the work.')
role(doc, 'Shellpoint Mortgage Servicing', 'Foreclosure Specialist', 'Feb 2014 to Oct 2018')
bullet(doc, 'Managed more than 400 active foreclosure files, working directly with investors and attorney firms on complex cases and missing documentation.')
bullet(doc, 'Advanced within 18 months to team lead and primary investor contact for a demanding investor team. Took on escalated cases requiring more detailed review.')
bullet(doc, 'Reconstructed a stalled litigation file using court records and other outside sources to establish the case timeline and meet the judge\'s documentation requirements.')
doc.add_paragraph('Skills and Tools', 'Heading 1')
doc.add_paragraph('Client implementation and training; order coordination; delivery updates; issue resolution; process documentation; coordination across departments; Excel including VLOOKUP; Salesforce; Jira; Confluence; BPCS; Clearview.')
doc.add_paragraph('Trained at least 12 new hires across Alcon, Glowforge, and YKK AP America through shadowing, written guides, walkthroughs, and practice sessions.')
doc.add_paragraph('Education', 'Heading 1')
doc.add_paragraph('Bachelor of Business Administration | University of Texas at Dallas | Dec 2008')
doc.save(ROOT / 'QThibodeauxResumeEzeeFiber.docx')

doc = base(11)
doc.core_properties.title = 'Quintus Thibodeaux Cover Letter for Ezee Fiber'
doc.add_paragraph('November 2, 2026')
doc.add_paragraph('Hiring Team\nEzee Fiber\nHouston, TX')
p = doc.add_paragraph('Application for Implementation Coordinator Enterprise')
p.runs[0].bold = True
doc.add_paragraph('Dear Hiring Team,')
paragraphs = [
    'I am applying for the Implementation Coordinator, Enterprise position because much of my work has involved keeping customer orders and implementations moving while several departments handle different parts of the job. At YKK AP America, I manage orders from the initial drawing review through production, shipment updates, and any corrections afterward. At Alcon, I guided optometry practices through onboarding that took place over several weeks.',
    'My title at YKK is Customer Service Rep, Order Coordination. The work includes reviewing architectural and engineering drawings, resolving questions with estimating, and keeping customers and their project managers informed when requirements or delivery dates change. I lead the team in order count and dollar volume and enter 95% of orders within two business days. When an order error put a customer\'s delivery at risk, I clarified their priorities and reworked the order around available inventory and timelines. The material reached them approximately three weeks earlier than originally scheduled.',
    'At Alcon, I worked on a team of two serving Texas clients. For one practice with four locations, I implemented the first two sites and then worked with their trained staff to help onboard the other branches. I also delivered live training and helped establish implementation procedures and service level agreements. These experiences are directly relevant to coordinating handoffs and keeping customers informed throughout an installation.',
    'Fiber installations would be a new industry for me, and formal project budgeting and financial forecasting would be new responsibilities. My related experience includes handling invoices and credits, reducing avoidable shipping costs, and working with delivery constraints. I would bring that experience, along with Jira, Salesforce, and Excel skills, while learning Ezee Fiber\'s processes.',
    'I would appreciate the chance to discuss how I could help your enterprise customers get from an approved order to a completed installation. Thank you for considering my application.'
]
for text in paragraphs:
    p = doc.add_paragraph(text)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.line_spacing = 1.05
doc.add_paragraph('Sincerely,\nQuintus Thibodeaux')
doc.save(ROOT / 'QThibodeauxCLEzeeFiber.docx')
print('Created resume and cover letter')
