#gcloud auth login
gcloud config set project dutchdesignapi
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com

gcloud projects add-iam-policy-binding dutchdesignapi \
  --member serviceAccount:dutchdesignbot@dutchdesignapi.iam.gserviceaccount.com \
  --role roles/cloudsql.client

gcloud secrets add-iam-policy-binding DDW_DB_PASSWORD \
    --member="serviceAccount:dutchdesignbot@dutchdesignapi.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding dutchdesignapi \
    --member="serviceAccount:dutchdesignbot@dutchdesignapi.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

docker build --platform linux/amd64 -t gcr.io/dutchdesignapi/fastapi-backend .

gcloud auth configure-docker
docker push gcr.io/dutchdesignapi/fastapi-backend

gcloud container images list --repository=gcr.io/dutchdesignapi

gcloud run deploy fastapi-backend \
  --image gcr.io/dutchdesignapi/fastapi-backend \
  --add-cloudsql-instances=dutchdesignapi:europe-west4:dutchdesigndb \
  --service-account=dutchdesignbot@dutchdesignapi.iam.gserviceaccount.com \
  --set-env-vars=INSTANCE_CONNECTION_NAME="dutchdesignapi:europe-west4:dutchdesigndb",DATABASE_USER="postgres",DATABASE_NAME="postgres",DATABASE_TABLE="answers" \
  --set-secrets=DATABASE_PASSWORD=DDW_DB_PASSWORD:latest \
  --platform managed \
  --region europe-west4\
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 2 \
  --min-instances 1 \
  --port 8080
