<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Patient Archive - {{ $category }}</title>
    <style>
        /* Define page margins */
        @page {
            margin: 0.5cm;
            /* Small margin to prevent edge clipping on printers */
        }

        body {
            font-family: 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #333;
        }

        /* Header and Info Bar should only appear on the first page or repeat? 
           Usually, we want images to have max space. */
        .header {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 15px 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .info-bar {
            background-color: #f4f4f4;
            padding: 8px 20px;
            font-size: 10px;
            border-bottom: 1px solid #ddd;
            margin-bottom: 10px;
        }

        /* Container for the image logic */
        .image-container {
            width: 100%;
            /* Calculate height to account for header/info bar on page 1.
               For subsequent pages, 95vh ensures it doesn't bleed over.
            */
            height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            text-align: center;
        }

        .image-container:last-child {
            page-break-after: auto;
        }

        .scanned-image {
            /* This is the secret sauce for "Auto-Fit" */
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }

        .footer {
            position: fixed;
            bottom: 5px;
            width: 100%;
            text-align: center;
            font-size: 22px;
            color: #999;
        }

        /* Ensure blank record is centered */
        .no-content {
            padding: 100px 20px;
            text-align: center;
            color: #ccc;
        }
    </style>
</head>

<body>



    <div class="content">
        @if(isset($importImages) && count($importImages) > 0)
        @foreach($importImages as $img)
            <div class="header">
                <h1>{{ $category }}</h1>
            </div>
            <div class="info-bar">
                <strong>PATIENT:</strong> {{ strtoupper($patient->lastname) }}, {{ strtoupper($patient->firstname) }} |
                <strong>HRN:</strong> {{ $patient->hrn }} |
                <strong>DATE:</strong> {{ $date }}
            </div>
            <div class="image-container">
                <img src="{{ $img }}" class="scanned-image">
            </div>
        @endforeach
        @else
        <div class="no-content">
            <h2 style="text-transform: uppercase; letter-spacing: 5px;">Blank Record</h2>
            <p>No images have been appended to this folder yet.</p>
        </div>
        @endif
    </div>

    <div class="footer">
        CIMC Patient Record System - Uploaded on {{ $date }}
    </div>

</body>

</html>