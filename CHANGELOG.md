# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-01-27

### 🎉 Major Features

#### **Student Biodata PDF Generation**
- ✅ Complete biodata PDF template matching official format
- ✅ Comprehensive student data collection (personal, family, health, education history)
- ✅ 3x4 photo integration from R2 storage
- ✅ Professional layout with proper spacing and typography
- ✅ Download biodata from student detail page
- ✅ Database schema extended with 20+ new biodata fields
- ✅ Migration `0003_phase2_student_biodata.sql` for biodata columns

#### **Custom Cover Illustrations for Reports**
- ✅ Upload custom cover illustrations (PNG/JPEG, max 5MB)
- ✅ Store illustrations in R2 bucket with public URLs
- ✅ Database table `report_cover_illustrations` for managing covers
- ✅ PDF generation with custom illustration backgrounds
- ✅ Automatic fallback to simple text cover if illustration unavailable
- ✅ Cover settings UI with tabs: Logo Cover, Illustrations, Preferences
- ✅ Mock R2 bucket for local development testing

#### **Student Photo Upload & Management**
- ✅ Upload student photos (3x4 ratio, max 2MB)
- ✅ Photo storage in R2 bucket per student
- ✅ Photo preview in student profile
- ✅ Delete and replace photo functionality
- ✅ Integration with biodata PDF generation

### 🔧 Technical Improvements

#### **Database**
- ✅ Migration `0002_phase2_cover.sql` - Cover illustrations & logo URLs
- ✅ Migration `0003_phase2_student_biodata.sql` - Student biodata fields
- ✅ Schema updates for `students`, `school_profiles`, `report_cover_illustrations`
- ✅ Proper snake_case to camelCase mapping in Drizzle ORM

#### **API Endpoints**
- ✅ `GET/POST/DELETE /api/settings/cover-upload` - Cover asset management
- ✅ `GET/POST/PUT /api/students/biodata` - Biodata CRUD operations
- ✅ `GET /api/reports/student/[id]/biodata` - Biodata PDF generation
- ✅ `POST/DELETE /api/students/photo` - Photo upload/delete
- ✅ Enhanced error handling with helpful messages
- ✅ Mock R2 bindings for local development

#### **PDF Generation**
- ✅ Migrated from `@react-pdf/renderer` to `jsPDF` for better edge compatibility
- ✅ Async PDF generation with image loading from R2
- ✅ Custom cover illustration rendering with text overlay
- ✅ Biodata template with proper formatting and layout
- ✅ Semester report template (existing, enhanced)
- ✅ Image fetch with timeout and error handling

#### **UI/UX Enhancements**
- ✅ Cover settings page with 3 tabs (Logo, Illustrations, Preferences)
- ✅ Biodata form with comprehensive fields and validation
- ✅ Photo upload with preview and delete functionality
- ✅ Development mode notices for features requiring production
- ✅ Toast notifications for all upload/delete operations
- ✅ Loading states and error handling throughout

### 📝 Documentation

#### **New Documentation Files**
- ✅ `docs/COVER-ILLUSTRATION-DEV-NOTES.md` - Development workflow for covers
- ✅ `docs/COVER-UPLOAD-FIX.md` - Troubleshooting upload issues
- ✅ `docs/COVER-SETTINGS-TROUBLESHOOTING.md` - General cover settings guide
- ✅ `docs/BIODATA-IMPLEMENTATION.md` - Biodata feature documentation
- ✅ `drizzle/check-cover-tables.sql` - Verify cover tables exist
- ✅ `drizzle/ensure-cover-tables.sql` - Create missing cover tables

#### **Updated Documentation**
- ✅ README.md - Updated with Phase 2 features
- ✅ TASKS.md - Phase 2 stories and progress tracking

### 🐛 Bug Fixes
- ✅ Fixed NextResponse type error with Uint8Array in PDF generation
- ✅ Fixed R2 binding unavailability in local development
- ✅ Fixed database context errors in cover upload API
- ✅ Fixed accessibility issues in cover settings UI
- ✅ Fixed unused variable warnings in PDF generator
- ✅ Proper error handling for missing tables/columns

### 🔒 Security
- ✅ File type validation for uploads (PNG/JPEG only)
- ✅ File size limits (5MB for covers, 2MB for photos)
- ✅ Session-based authentication for all upload endpoints
- ✅ Proper R2 bucket permissions and CORS configuration

### ⚙️ Configuration
- ✅ Updated `package.json` with new scripts
- ✅ R2 bucket binding in `wrangler.toml`
- ✅ Mock R2 implementation for local development
- ✅ Database migration scripts for Phase 2

### 🧪 Testing
- ✅ Manual testing of all upload flows
- ✅ PDF generation testing with various data combinations
- ✅ Error scenario testing (missing files, invalid data)
- ✅ Local development workflow verification

---

## [1.0.0] - 2025-01-14

### 🎉 Initial Release - MVP Complete

#### **Core Features**
- ✅ User authentication with iron-session
- ✅ School profile setup wizard
- ✅ Student management (CRUD operations)
- ✅ CSV import for bulk student data
- ✅ Monthly journal tracking (5 aspects)
- ✅ Meeting logs management
- ✅ Intervention planning
- ✅ Student detail view with tabs
- ✅ Dashboard with statistics
- ✅ Semester report PDF generation

#### **Technical Stack**
- Next.js 15.5.2 (App Router)
- TypeScript (Strict mode)
- Drizzle ORM with Cloudflare D1
- TailwindCSS + HeroUI components
- Cloudflare Pages deployment
- R2 Storage for file uploads

#### **Database Schema**
- `users` - User accounts
- `school_profiles` - School information
- `students` - Student records
- `monthly_journals` - Monthly tracking
- `meeting_logs` - Meeting records
- `interventions` - Intervention plans

---

## Release Notes

### Version 2.0.0 Highlights

This major release focuses on **professional reporting and customization**:

1. **Biodata PDF** - Complete student biodata forms matching official requirements
2. **Custom Covers** - Upload custom illustrations for report covers
3. **Student Photos** - Manage student photos with 3x4 ratio
4. **Enhanced PDF** - Better PDF generation with image support
5. **Better DX** - Mock R2 for local development, improved error handling

### Breaking Changes
- None - Fully backward compatible with v1.0.0

### Migration Guide
1. Run database migrations:
   ```bash
   bun run db:migrate:prod
   ```
2. Verify R2 bucket exists and CORS configured
3. Deploy to production
4. Test cover upload and biodata generation

### Known Limitations
- Cover illustration preview only works in production (Mock R2 in local dev)
- Photo upload requires production R2 bucket
- PDF generation with images requires network access to R2

---

**Full Changelog**: https://github.com/yourusername/prj-guru-wali/compare/v1.0.0...v2.0.0
