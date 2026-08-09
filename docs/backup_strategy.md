# Backup & Recovery Plan
- **Database**: Nightly `mongodump` cron job uploaded to AWS S3.
- **Model**: Saved `.keras` formats versioned via Git LFS.
- **Disaster Recovery**: Re-provision EC2 via Terraform, pull latest Docker image, restore DB from S3. ETA: 15 mins.
