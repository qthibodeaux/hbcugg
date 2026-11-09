from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent

def base():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = section.bottom_margin = Inches(0.65)
    section.left_margin = section.right_margin = Inches(0.7)
    for name, size in [('Normal', 11), ('Title', 23), ('Heading 1', 11)]:
        style = doc.styles[name]
        style.font.name = 'Calibri'
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor(0, 0, 0)
        style.font.bold = name != 'Normal'
        style.paragraph_format.line_spacing = 1.05
        style.paragraph_format.space_after = Pt(6)
        style.paragraph_format.space_before = Pt(8 if name == 'Heading 1' else 0)
    doc.core_properties.author = 'Quintus Thibodeaux'
    doc.add_paragraph('Quintus Thibodeaux', 'Title')
    doc.add_paragraph('Houston, TX | 281-734-8561 | qthibgit@gmail.com')
    return doc

def role(doc, employer, title, dates):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(7)
    p.paragraph_format.keep_with_next = True
    p.add_run(employer).bold = True
    p.add_run(' | ' + dates)
    p = doc.add_paragraph(title)
    p.paragraph_format.keep_with_next = True
    p.runs[0].italic = True

def bullets(doc, entries):
    for text in entries:
        p = doc.add_paragraph(text, 'List Bullet')
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.05

resume = base()
resume.core_properties.title = 'Quintus Thibodeaux Resume for FF Inc'
resume.add_paragraph('Professional Summary', 'Heading 1')
resume.add_paragraph('Customer service and implementation experience supporting clients from initial setup through ongoing questions, technical problems, and order changes. Maintained 98% customer satisfaction at Glowforge and guided optometry practices through onboarding at Alcon. Currently manage customer orders and delivery communication at YKK AP America. Experienced with Salesforce, Jira, Confluence, and training customers with different levels of technical comfort.')
resume.add_paragraph('Professional Experience', 'Heading 1')
role(resume, 'YKK AP America', 'Customer Service Rep, Order Coordination', 'Feb 2024 to Present')
bullets(resume, [
    'Serve as a customer contact from order entry through production, shipment, and warranty documentation. Answer questions, explain changes, and resolve incorrect orders, invoices, and credits.',
    'Manage more than 50 emails and approximately 15 calls daily while entering 95% of orders within two business days. Lead the team in order count and dollar volume.',
    'Work with estimating, warehouse staff, sales, and management to resolve customer questions and delivery issues. Review architectural and engineering drawings to clarify order requirements.',
    'Moved a customer\'s delivery forward by approximately three weeks after an order error. Asked about the customer\'s priorities and reworked the order using available inventory and timelines.',
    'Created templates for common quote changes, reducing estimator turnaround and repeated clarification. Serve as an informal team lead and review coworkers\' orders for accuracy.'
])
role(resume, 'Glowforge', 'Technical Support', 'Jan 2023 to Feb 2024')
bullets(resume, [
    'Maintained 98% customer satisfaction while helping customers resolve equipment, software, firmware, and design file problems in a remote support role.',
    'Handled approximately 30 calls daily alongside chat conversations and a ticket queue. Managed overlapping requests while walking customers through troubleshooting steps.',
    'Worked through complex cases involving several causes, including file errors, machine maintenance, material setup, and heat damage. Explained technical steps in language customers could follow.',
    'Wrote internal troubleshooting guides and customer help articles. Contributed to support workflows and service level agreements as the company developed its processes.'
])
resume.add_page_break()
resume.add_paragraph('Professional Experience Continued', 'Heading 1')
role(resume, 'Alcon', 'Implementation Consultant', 'May 2019 to Oct 2022')
bullets(resume, [
    'Guided optometry practices through onboarding lasting several weeks, answering questions and helping clients learn Alcon\'s Marlo system and related processes.',
    'Shared the Texas client workload with one other implementation consultant, handling more than 14 client accounts or interactions per day.',
    'Led live training for practice owners and office staff. Adjusted explanations and examples to each person\'s responsibilities, technical knowledge, and daily workflow.',
    'Coordinated onboarding for a client with four locations. Implemented the first two sites directly, then worked with their trained staff to support the remaining branches.',
    'Adapted a difficult training session by involving the lead office staff member who would use the system daily, helping the practice connect the training to its actual workflow.',
    'Helped develop implementation procedures and service level agreements. Used Salesforce, Jira, Confluence, and Marlo to support client implementations.'
])
resume.add_paragraph('Training and Team Support', 'Heading 1')
resume.add_paragraph('Trained at least 12 new hires across Alcon, Glowforge, and YKK AP America using shadowing, written guides, walkthroughs, and practice sessions. At YKK, helped a coworker learn unfamiliar digital tools by relating the new steps to processes he already understood.')
resume.add_paragraph('Skills and Tools', 'Heading 1')
resume.add_paragraph('Customer onboarding and product training; customer communication; technical troubleshooting; order coordination; issue resolution; coordination across departments; process documentation; Salesforce; Jira; Confluence; Excel including VLOOKUP; BPCS; Clearview.')
resume.add_paragraph('Education', 'Heading 1')
resume.add_paragraph('Bachelor of Business Administration\nUniversity of Texas at Dallas | Dec 2008')
resume.save(ROOT / 'QThibodeauxResumeFFInc.docx')

letter = base()
letter.core_properties.title = 'Quintus Thibodeaux Cover Letter for FF Inc'
letter.add_paragraph('November 3, 2026')
letter.add_paragraph('Hiring Team\nFF Inc\nSugar Land, TX')
p = letter.add_paragraph('Application for Customer Success Representative')
p.runs[0].bold = True
letter.add_paragraph('Dear Hiring Team,')
for text in [
    'I am applying for the Customer Success Representative position with FF Inc. My experience includes helping customers learn new systems, resolving technical problems, and managing orders from the first request through delivery. I have worked with customers who needed a quick answer and others who needed more time and explanation to feel comfortable using a product.',
    'At Glowforge, I maintained 98% customer satisfaction while supporting customers by phone, chat, and support tickets. Problems could involve the machine, software, a design file, or the material being used. I worked through those issues with customers and explained the steps in terms they could understand. I also wrote help articles and internal guides so customers and coworkers had clearer answers to recurring questions.',
    'At Alcon, I guided optometry practices through onboarding over several weeks. I trained both practice owners and office staff and adjusted the sessions to how they would actually use the system. For a client with four locations, I implemented the first two and then worked with their staff to help onboard the remaining branches.',
    'In my current role at YKK AP America, I stay involved through order changes, production updates, delivery questions, and corrections. When an order error left a customer facing a delivery date they could not accept, I asked about their priorities and reworked the order around available inventory. That brought delivery forward by approximately three weeks.',
    'I would bring FF Inc experience with Salesforce, patience when customers need additional help, and a habit of following a problem through to a resolution. I would welcome the opportunity to discuss how that experience fits your team. Thank you for considering my application.'
]:
    p = letter.add_paragraph(text)
    p.paragraph_format.space_after = Pt(10)
letter.add_paragraph('Sincerely,\nQuintus Thibodeaux')
letter.save(ROOT / 'QThibodeauxCLFFInc.docx')

for file in ROOT.glob('*.docx'):
    text = '\n'.join(p.text for p in Document(file).paragraphs)
    assert not re.search(r'[A-Za-z][-\u2010-\u2015][A-Za-z]|[\u2013\u2014]', text)
    assert all(term not in text for term in ['DigitalCrafts', 'Supabase', 'HubSpot', 'SaaS'])
    print(file.name, len(text.split()), 'words; wording checks passed')
