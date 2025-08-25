# PowerShell script to create banner images using .NET
Add-Type -AssemblyName System.Drawing

# Create images/banners directory if it doesn't exist
$bannerPath = "D:\wavespace\images\banners"
if (!(Test-Path $bannerPath)) {
    New-Item -ItemType Directory -Path $bannerPath -Force
}

# Function to create banner
function Create-Banner {
    param(
        [string]$filename,
        [string]$text,
        [string]$subtext,
        [string]$colorHex
    )
    
    $width = 1200
    $height = 180
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Convert hex to color
    $color = [System.Drawing.ColorTranslator]::FromHtml($colorHex)
    
    # Fill background
    $brush = New-Object System.Drawing.SolidBrush($color)
    $graphics.FillRectangle($brush, 0, 0, $width, $height)
    
    # Add text
    $font = New-Object System.Drawing.Font("Arial", 32, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    # Center text
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # Draw main text
    $rect = New-Object System.Drawing.RectangleF(0, 40, $width, 60)
    $graphics.DrawString($text, $font, $textBrush, $rect, $format)
    
    # Draw subtext
    $subfont = New-Object System.Drawing.Font("Arial", 18)
    $rect2 = New-Object System.Drawing.RectangleF(0, 100, $width, 40)
    $graphics.DrawString($subtext, $subfont, $textBrush, $rect2, $format)
    
    # Save image
    $fullPath = Join-Path $bannerPath $filename
    $bitmap.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    $subfont.Dispose()
    
    Write-Host "Created: $fullPath"
}

# Create three banners
Create-Banner -filename "banner1.jpg" -text "WAVE SPACE" -subtext "Real Estate Innovation Platform" -colorHex "#3080ff"
Create-Banner -filename "banner2.jpg" -text "New Member Event" -subtext "Get 1,000 Points Now!" -colorHex "#00c896"
Create-Banner -filename "banner3.jpg" -text "Plus Membership" -subtext "Premium Service 29,000 KRW/month" -colorHex "#ff6b35"

Write-Host "`nBanner images created successfully in: $bannerPath"