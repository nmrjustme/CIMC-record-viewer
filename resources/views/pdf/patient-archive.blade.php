<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .content { margin-top: 20px; text-align: center; }
        .patient-info { margin-bottom: 20px; }
        .imported-image { max-width: 100%; height: auto; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CIMC RECORD VIEWER</h1>
        <p>Category: {{ $category }} | Date: {{ $date }}</p>
    </div>

    <div class="patient-info">
        <strong>Patient Name:</strong> {{ $patient->lastname }}, {{ $patient->firstname }} {{ $patient->middlename }}<br>
        <strong>HRN:</strong> {{ $patient->hrn }}
    </div>

    <div class="content">
        @if($importImage)
            <img src="{{ $importImage }}" class="imported-image">
        @else
            <p style="color: red;">No image was uploaded for this record.</p>
        @endif
    </div>
</body>
</html>