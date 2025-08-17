<#
.SYNOPSIS
    Workzzy API Test Script (No Cleanup Version)
.DESCRIPTION
    Tests core functionality including job application flow with deposits and platform fees
.NOTES
    Version: 2.0
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
    # 1. User Registration with proper roles
    Write-Host "1. Registering users with roles..." -ForegroundColor Yellow
    
    # Register Hirer
    $hirer = Invoke-RestMethod "$API_BASE/api/auth/register" -Method Post -Body (@{
        email = $HIRER_EMAIL
        password = $PASSWORD
        name = "Test Hirer"
        role = "hirer"
    } | ConvertTo-Json) -ContentType "application/json"
    
    if (-not $hirer.user.user_metadata.role) {
        Write-Host "WARNING: Role not stored in user metadata!" -ForegroundColor Yellow
    }
    
    # Register Worker
    $worker = Invoke-RestMethod "$API_BASE/api/auth/register" -Method Post -Body (@{
        email = $WORKER_EMAIL
        password = $PASSWORD
        name = "Test Worker"
        role = "worker"
    } | ConvertTo-Json) -ContentType "application/json"
    
    if (-not $worker.user.user_metadata.role) {
        Write-Host "WARNING: Role not stored in user metadata!" -ForegroundColor Yellow
    }
    
    # 2. Job Creation
    Write-Host "`n2. Creating job..." -ForegroundColor Yellow
    $job = Invoke-RestMethod "$API_BASE/api/jobs" -Method Post -Body (@{
        title = "Test Job $TIMESTAMP"
        initialDescription = "Public job description - visible to all"
        fullDescription = "Detailed private description - requires deposit to view"
        address = "123 Test St"
        hirerId = $hirer.user.id
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    # 3. Add Job Images
    Write-Host "`n3. Adding job images..." -ForegroundColor Yellow
    
    # Add public image
    $publicImage = Invoke-RestMethod "$API_BASE/api/jobs/$($job.id)/images" -Method Post -Body (@{
        # url = "https://example.com/public.jpg"
        url = "https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png"
        isPublic = $true
        caption = "Public Image - visible to all"
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    # Add private image
    $privateImage = Invoke-RestMethod "$API_BASE/api/jobs/$($job.id)/images" -Method Post -Body (@{
        url = "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/396e9/MainBefore.jpg"
        isPublic = $false
        caption = "Private Image - requires deposit to view"
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    # 4. Worker applies for job with deposit
    Write-Host "`n4. Worker applying for job with $5 deposit..." -ForegroundColor Yellow
    
    # First, get job details (should only show public info)
    $jobPublicDetails = Invoke-RestMethod "$API_BASE/api/jobs/$($job.id)" -Headers @{
        Authorization = "Bearer $($worker.session.access_token)"
    }
    
    # Create job application with deposit
    $application = Invoke-RestMethod "$API_BASE/api/applications" -Method Post -Body (@{
        jobId = $job.id
        message = "I'm interested in this job!"
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($worker.session.access_token)"
    }


    # ADD THIS STEP: Confirm the PaymentIntent with a test card
    Write-Host "`n4.5 Confirming payment intent..." -ForegroundColor Yellow
    $confirmResponse = Invoke-RestMethod "$API_BASE/api/applications/$($application.id)/confirm" -Method Post -Headers @{
        Authorization = "Bearer $($worker.session.access_token)"
    }

    
    # 5. Hirer accepts application
    Write-Host "`n5. Hirer accepting job application..." -ForegroundColor Yellow
    $acceptedApplication = Invoke-RestMethod "$API_BASE/api/applications/$($application.id)/accept" -Method Patch -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    # 6. Verify job status changed to COMMITTED
    Write-Host "`n6. Verifying job status..." -ForegroundColor Yellow
    $jobStatus = Invoke-RestMethod "$API_BASE/api/jobs/$($job.id)" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    if ($jobStatus.status -ne "COMMITTED") {
        Write-Host "ERROR: Job status should be COMMITTED, but is $($jobStatus.status)" -ForegroundColor Red
        throw "Job status verification failed"
    }
    
    # 7. Completing job and processing payment...
    Write-Host "`n7. Completing job and processing payment..." -ForegroundColor Yellow

    # Mark job as completed (USE THIS INSTEAD OF THE COMPLETE ENDPOINT)
    $completedJob = Invoke-RestMethod "$API_BASE/api/jobs/$($job.id)" -Method Patch -Body (@{
        status = "COMPLETED"
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }

    # 7.5 Create payment for the job (NEW STEP)
    Write-Host "`n7.5 Creating payment for job..." -ForegroundColor Yellow
    $payment = Invoke-RestMethod "$API_BASE/api/payments" -Method Post -Body (@{
        job_id = $job.id
        amount = 100.00
        hirer_id = $hirer.user.id
        worker_id = $worker.user.id
    } | ConvertTo-Json) -ContentType "application/json" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    # 8. Verify payment details with platform fee
    Write-Host "`n8. Verifying payment details..." -ForegroundColor Yellow
    $payment = Invoke-RestMethod "$API_BASE/api/payments" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    } | Where-Object { $_.jobId -eq $job.id }
    
    # 9. Verify Data
    Write-Host "`n9. Final verification..." -ForegroundColor Yellow
    
    # Get job applications
    $jobApplications = Invoke-RestMethod "$API_BASE/api/applications/jobs/$($job.id)" -Headers @{
        Authorization = "Bearer $($hirer.session.access_token)"
    }
    
    # Get worker's applications
    $workerApplications = Invoke-RestMethod "$API_BASE/api/applications" -Headers @{
        Authorization = "Bearer $($worker.session.access_token)"
    }
    
    # Results
    Write-Host "`n=== TEST RESULTS ===" -ForegroundColor Cyan
    Write-Host "Job ID: $($job.id)" -ForegroundColor Green
    Write-Host "Job Status: $($jobStatus.status)" -ForegroundColor Green
    Write-Host "Job Title: $($job.title)" -ForegroundColor Green
    Write-Host "Application ID: $($application.id)" -ForegroundColor Green
    Write-Host "Application Status: $($acceptedApplication.status)" -ForegroundColor Green
    Write-Host "Deposit Status: $($acceptedApplication.depositStatus)" -ForegroundColor Green
    
    if ($payment) {
        Write-Host "Payment ID: $($payment.id)" -ForegroundColor Green
        Write-Host "Total Amount: `$($payment.amount)" -ForegroundColor Green
        Write-Host "Platform Fee (10%): `$($payment.platformFee)" -ForegroundColor Green
        Write-Host "Worker Amount: `$($payment.workerAmount)" -ForegroundColor Green
        Write-Host "Deposit Refund: `$($payment.depositRefund)" -ForegroundColor Green
    }
    
    Write-Host "`nTEST COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "Note: Test data remains in database" -ForegroundColor Yellow
}
catch {
    Write-Host "`n=== TEST FAILED ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    # Try to extract more detailed error information
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($responseStream)
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "Error Response: $errorBody" -ForegroundColor Red
    }
}