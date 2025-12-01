import logging
import io
from datetime import datetime
from app.celery_app import celery_app
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)
storage_service = StorageService()


@celery_app.task(bind=True)
def generate_shopping_list_pdf(
    self,
    list_id: str,
    design_name: str,
    items: list,
    total_cost: float,
    user_info: dict = None
):
    """
    Generate a PDF shopping list
    
    Args:
        list_id: Shopping list ID
        design_name: Name of the design
        items: List of furniture items
        total_cost: Total cost
        user_info: Optional user information
    
    Returns:
        URL of generated PDF
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
        from reportlab.lib.units import inch, cm
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        
        logger.info(f"Generating PDF for shopping list {list_id}")
        
        self.update_state(
            state="PROGRESS",
            meta={"progress": 10, "status": "Creating PDF..."}
        )
        
        # Create PDF buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.grey,
            spaceAfter=20,
        )
        
        # Build document elements
        elements = []
        
        # Title
        elements.append(Paragraph("RoomAI 购物清单", title_style))
        elements.append(Paragraph(f"设计方案: {design_name}", subtitle_style))
        elements.append(Paragraph(
            f"生成时间: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}",
            subtitle_style
        ))
        elements.append(Spacer(1, 20))
        
        self.update_state(
            state="PROGRESS",
            meta={"progress": 40, "status": "Adding items..."}
        )
        
        # Table header
        table_data = [
            ['序号', '商品名称', '品牌', '尺寸', '数量', '单价', '小计']
        ]
        
        # Table rows
        for i, item in enumerate(items):
            subtotal = item.get('price', 0) * item.get('quantity', 1)
            table_data.append([
                str(i + 1),
                item.get('name', ''),
                item.get('brand', '-'),
                item.get('dimensions', '-'),
                str(item.get('quantity', 1)),
                f"¥{item.get('price', 0):,.0f}",
                f"¥{subtotal:,.0f}"
            ])
        
        # Total row
        table_data.append(['', '', '', '', '', '总计:', f"¥{total_cost:,.0f}"])
        
        # Create table
        table = Table(table_data, colWidths=[1*cm, 5*cm, 2.5*cm, 3*cm, 1.5*cm, 2*cm, 2*cm])
        table.setStyle(TableStyle([
            # Header style
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e26d47')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            
            # Body style
            ('BACKGROUND', (0, 1), (-1, -2), colors.HexColor('#fafaf9')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#292524')),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            
            # Total row style
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f5f5f4')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 11),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e7e5e4')),
            
            # Alignment
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (4, 0), (-1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 30))
        
        self.update_state(
            state="PROGRESS",
            meta={"progress": 70, "status": "Adding notes..."}
        )
        
        # Notes
        notes_style = ParagraphStyle(
            'Notes',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
        )
        elements.append(Paragraph("备注:", styles['Heading3']))
        elements.append(Paragraph(
            "• 价格仅供参考，实际价格请以商家官网为准",
            notes_style
        ))
        elements.append(Paragraph(
            "• 部分商品可能存在缺货情况，建议提前确认库存",
            notes_style
        ))
        elements.append(Paragraph(
            "• 如需了解更多设计方案，请访问 roomai.com",
            notes_style
        ))
        
        # Build PDF
        self.update_state(
            state="PROGRESS",
            meta={"progress": 85, "status": "Generating PDF..."}
        )
        
        doc.build(elements)
        
        # Upload to storage
        buffer.seek(0)
        import asyncio
        loop = asyncio.get_event_loop()
        pdf_url = loop.run_until_complete(
            storage_service.upload_file(
                buffer.getvalue(),
                f"exports/{list_id}/shopping_list.pdf",
                "application/pdf"
            )
        )
        
        logger.info(f"PDF generated successfully for list {list_id}")
        
        return {
            "list_id": list_id,
            "pdf_url": pdf_url,
            "items_count": len(items),
            "total_cost": total_cost
        }
        
    except Exception as e:
        logger.error(f"PDF generation failed for list {list_id}: {e}")
        raise


@celery_app.task(bind=True)
def generate_design_report(
    self,
    project_id: str,
    design_data: dict,
    analysis_data: dict
):
    """
    Generate a comprehensive design report
    
    Args:
        project_id: Project ID
        design_data: Design proposal data
        analysis_data: Room analysis data
    
    Returns:
        URL of generated report
    """
    try:
        logger.info(f"Generating design report for project {project_id}")
        
        # This would generate a more comprehensive PDF report
        # including before/after images, analysis details, etc.
        
        # For now, return a placeholder
        return {
            "project_id": project_id,
            "report_url": f"/reports/{project_id}/design_report.pdf",
            "status": "generated"
        }
        
    except Exception as e:
        logger.error(f"Report generation failed for project {project_id}: {e}")
        raise

