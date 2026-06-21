# Music Upload Acceptance Check

Use this check when the music panel appears to upload nothing, delete nothing, or Supabase Storage returns `400`.

The command signs in as the owner, uploads test files with the same risky filename shapes as the live issue:

- `Andrew Prahlow - Travelers' encore.flac`
- `星际拓荒.jpg`

Then it saves a temporary music row, deletes it, and removes the uploaded Storage objects.

Run it only from your own local terminal:

```powershell
$env:OWNER_EMAIL="your-owner-email@example.com"
$env:OWNER_PASSWORD="your-site-password"
npm run verify:owner-music-storage
Remove-Item Env:\OWNER_EMAIL
Remove-Item Env:\OWNER_PASSWORD
```

Never commit, screenshot, or paste those credentials into GitHub or Supabase SQL Editor.

If this command fails with Storage `400`, RLS, or policy text:

1. Open `supabase/fix-live-database.sql`.
2. Copy the SQL content, not the local Windows file path.
3. Paste it into Supabase SQL Editor.
4. Run it.
5. Run `npm run verify:owner-music-storage` again.
