import zipfile
import xml.etree.ElementTree as ET

def read_docx(file_path):
    try:
        doc = zipfile.ZipFile(file_path)
        xml_content = doc.read('word/document.xml')
        tree = ET.XML(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paragraphs = []
        for p in tree.findall('.//w:p', namespace):
            texts = [node.text for node in p.findall('.//w:t', namespace) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

with open('Affiliate_Review_Site_PRD_v1.1.txt', 'w', encoding='utf-8') as f:
    f.write(read_docx('Affiliate_Review_Site_PRD_v1.1.docx'))

with open('Affiliate_Database_Schema_v1.2.txt', 'w', encoding='utf-8') as f:
    f.write(read_docx('Affiliate_Database_Schema_v1.2.docx'))
