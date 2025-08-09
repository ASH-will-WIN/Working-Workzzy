<#
.SYNOPSIS
    Workzzy API Test Script (No Cleanup Version)
.DESCRIPTION
    Tests core functionality without delete operations
.NOTES
    Version: 1.3
    Requires: PowerShell 5.1+
#>

$API_BASE = "http://localhost:5000"
$TIMESTAMP = (Get-Date).ToFileTime()
$HIRER_EMAIL = "hirer_$TIMESTAMP@example.com"
$WORKER_EMAIL = "worker_$TIMESTAMP@example.com"
$PASSWORD = "securepassword123"

Write-Host "`n=== WORKZZY API TEST ===" -ForegroundColor Cyan
Write-Host "Test Timestamp: $TIMESTAMP`n" -ForegroundColor Cyan

try {
    # 1. User Registration
    Write-Host "1. Registering users..." -ForegroundColor Yellow
    $hirer = Invoke-RestMethod "$API_BASE/api/auth/register" -Method Post -Body (@{
        email = $HIRER_EMAIL
        password = $PASSWORD
        name = "Test Hirer"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $worker = Invoke-RestMethod "$API_BASE/api/auth/register" -Method Post -Body (@{
        email = $WORKER_EMAIL
        password = $PASSWORD
        name = "Test Worker"
    } | ConvertTo-Json) -ContentType "application/json"

    # 2. Job Creation
    Write-Host "`n2. Creating job..." -ForegroundColor Yellow
    $job = Invoke-RestMethod "$API_BASE/api/jobs" -Method Post -Body (@{
        title = "Test Job $TIMESTAMP"
        initialDescription = "Test job"
        fullDescription = "Detailed description"
        address = "123 Test St"
        hirerId = $hirer.user.id
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }

    # 3. Accept Job
    Write-Host "`n3. Accepting job..." -ForegroundColor Yellow
    $acceptedJob = Invoke-RestMethod "$API_BASE/api/jobs/accept/$($job.id)" -Method Patch -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }

    # 4. Create Payment
    Write-Host "`n4. Creating payment..." -ForegroundColor Yellow
    $payment = Invoke-RestMethod "$API_BASE/api/payments" -Method Post -Body (@{
        job_id = $job.id
        amount = 99.99
        hirer_id = $hirer.user.id
        worker_id = $worker.user.id
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }

    # 5. Verify Data
    Write-Host "`n5. Verification..." -ForegroundColor Yellow
    $jobs = Invoke-RestMethod "$API_BASE/api/jobs" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    $payments = Invoke-RestMethod "$API_BASE/api/payments" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }

    # Results
    Write-Host "`n=== TEST RESULTS ===" -ForegroundColor Cyan
    Write-Host "Job ID: $($job.id)" -ForegroundColor Green
    Write-Host "Job Status: $($acceptedJob.status)" -ForegroundColor Green
    Write-Host "Payment ID: $($payment.payment.id)" -ForegroundColor Green
    Write-Host "Payment Status: $($payment.payment.status)" -ForegroundColor Green
    Write-Host "`nTEST COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "Note: Test data remains in database" -ForegroundColor Yellow
}
catch {
    Write-Host "`n=== TEST FAILED ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
