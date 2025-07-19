import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get('format') || 'text'
  
  const items = Array.from(db.shoppingListItems.values())
  
  if (format === 'csv') {
    const csv = [
      'name,quantityValue,quantityUnit,checked,sourceRecipeId',
      ...items.map(item => 
        `"${item.name}",${item.quantityValue || ''},${item.quantityUnit || ''},${item.checked},${item.sourceRecipeId || ''}`
      )
    ].join('\n')
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="shopping-list.csv"',
      },
    })
  } else {
    const text = items
      .map(item => {
        const qty = item.quantityValue && item.quantityUnit 
          ? `${item.quantityValue} ${item.quantityUnit} - ` 
          : ''
        return `${qty}${item.name}${item.checked ? ' (checked)' : ''}`
      })
      .join('\n')
    
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="shopping-list.txt"',
      },
    })
  }
}