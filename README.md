# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Fixing Image Upload Errors (CORS Configuration)

If you experience `FirebaseError: (storage/unknown)` when trying to upload images in the application, it is because your Firebase Storage bucket is not configured to allow requests from your website's domain. This is a security feature called CORS (Cross-Origin Resource Sharing).

To fix this, you need to apply the CORS configuration file included in this project (`storage.cors.json`) to your bucket.

**1. Find your Storage Bucket URL:**
   Your storage bucket URL is in your `.env` file, listed as `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`. It will look something like `gs://your-project-name.appspot.com`.

**2. Run the `gcloud` command:**
   Open a terminal that has the Google Cloud SDK (`gcloud`) installed and authenticated, and run the following command, replacing `<your-storage-bucket-url>` with the URL from your `.env` file:

   ```sh
   gcloud storage buckets update <your-storage-bucket-url> --cors-file=storage.cors.json
   ```

   For example:
   ```sh
   gcloud storage buckets update gs://my-news-app-123.appspot.com --cors-file=storage.cors.json
   ```

After running this command, image uploads in your application will work correctly.
