# PDF Caching Architecture

**Last Updated:** 2025-10-15  
**Status:** Production Ready

## Overview

Production-ready PDF generation system with intelligent caching, streaming support, and graceful degradation for development.

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Frontend (Reports Page)               │
│  - Click "Download Report" button               │
└────────────────┬────────────────────────────────┘
                 │ POST /api/reports/semester
                 ▼
┌─────────────────────────────────────────────────┐
│          API Route Handler                      │
│  - Validate session                              │
│  - Prepare data                                  │
│  - Check Cloudflare environment                  │
└────────┬───────────────────────┬─────────────────┘
         │                       │
    PRODUCTION              DEVELOPMENT
    (R2 Available)          (No R2)
         │                       │
         ▼                       ▼
┌─────────────────┐      ┌──────────────┐
│ PDF Report      │      │ Direct       │
│ Service         │      │ Generation   │
│ (with caching)  │      │ (fallback)   │
└────────┬────────┘      └──────┬───────┘
         │                       │
         ▼                       │
┌─────────────────┐              │
│ Cache Manager   │              │
│ - Check cache   │              │
│ - Generate hash │              │
│ - Invalidation  │              │
└────────┬────────┘              │
         │                       │
     CACHE MISS                  │
         │                       │
         ▼                       ▼
┌─────────────────────────────────┐
│    PDF Generator Service        │
│  - Progress tracking             │
│  - Timeout protection            │
│  - Streaming support             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ R2 Storage      │
│ - Store PDF     │
│ - Metadata      │
│ - Versioning    │
└─────────────────┘
```

## Components

### 1. R2 Storage Service (`lib/services/r2-storage.ts`)

**Responsibility:** Low-level R2 bucket operations

**Key Methods:**
- `put(key, content, metadata)` - Store PDF
- `get(key)` - Retrieve PDF
- `getMetadata(key)` - Get metadata without downloading
- `delete(key)` - Remove PDF
- `list(prefix)` - List stored PDFs

**Features:**
- Automatic hash calculation
- Metadata storage
- Prefix-based organization

### 2. PDF Cache Manager (`lib/services/pdf-cache-manager.ts`)

**Responsibility:** Intelligent caching with invalidation

**Key Methods:**
- `get(params, options)` - Retrieve cached PDF
- `set(params, content)` - Store in cache
- `invalidate(params)` - Remove specific cache
- `invalidateSemester()` - Remove semester caches
- `invalidateStudent()` - Remove student caches

**Cache Key Strategy:**
```typescript
{
  type: "semester" | "student",
  semester?: string,
  tahunAjaran?: string,
  studentId?: string,
  dataHash?: string  // MD5 of relevant data
}
```

**TTL (Time-To-Live):**
- Default: 3600 seconds (1 hour)
- Can be overridden per request
- Set to 0 for no expiry

### 3. PDF Generator Service (`lib/services/pdf-generator.ts`)

**Responsibility:** PDF generation with progress tracking

**Key Methods:**
- `generate(component, options)` - Generate PDF
- `generateStream(component, options)` - Stream PDF
- `estimateGenerationTime(pageCount)` - Estimate duration

**Progress Stages:**
1. **Preparing** (10%) - Template preparation
2. **Rendering** (30%) - PDF content rendering
3. **Finalizing** (90%) - Final processing
4. **Complete** (100%) - Ready for download

**Timeout Protection:**
- Default: 120 seconds
- Configurable per request
- Race condition with timeout promise

### 4. PDF Report Service (`lib/services/pdf-report-service.ts`)

**Responsibility:** High-level orchestration

**Key Methods:**
- `generateReport(component, cacheParams, options)` - Main entry point
- `generateReportStream(component, cacheParams, options)` - Streaming version
- `invalidateCache(params)` - Cache invalidation
- `getCacheStats()` - Cache statistics

**Flow:**
```
1. Check cache (unless skipCache=true)
2. If cached: Return immediately
3. If not cached: Generate new PDF
4. Store in cache for future requests
5. Return PDF with metadata
```

## Usage Examples

### Basic Usage (API Route)

```typescript
import { getServices } from "@/lib/services";
import { getCloudflareEnv } from "@/lib/cloudflare";

// Get Cloudflare environment
const env = getCloudflareEnv();

if (env?.STORAGE) {
  // Production: Use caching
  const services = getServices(env);
  
  const result = await services.reportService.generateReport(
    pdfComponent,
    {
      type: "semester",
      semester: "Ganjil",
      tahunAjaran: "2024/2025",
      dataHash: "abc123"
    }
  );
  
  console.log(`From cache: ${result.fromCache}`);
  return result.content;
} else {
  // Development: Direct generation
  const buffer = await renderToBuffer(pdfComponent);
  return buffer;
}
```

### With Progress Tracking

```typescript
const result = await services.reportService.generateReport(
  pdfComponent,
  cacheParams,
  {
    onProgress: (progress) => {
      console.log(`${progress.stage}: ${progress.progress}%`);
    }
  }
);
```

### Streaming Response

```typescript
for await (const chunk of services.reportService.generateReportStream(
  pdfComponent,
  cacheParams
)) {
  // Send chunk to client
  controller.enqueue(chunk);
}
```

### Cache Invalidation

```typescript
// Invalidate specific report
await services.reportService.invalidateCache({
  type: "semester",
  semester: "Ganjil",
  tahunAjaran: "2024/2025"
});

// Invalidate all semester reports
await services.cacheManager.invalidateSemester("Ganjil", "2024/2025");

// Invalidate student reports
await services.cacheManager.invalidateStudent(studentId);
```

## Performance Metrics

### Cold Start (No Cache)
- **5 students:** ~18 KB, ~2-3 seconds
- **30 students:** ~80-100 KB, ~15-20 seconds
- **40 students:** ~100-120 KB, ~25-30 seconds

### Warm Cache (Hit)
- **Any size:** < 1 second
- **Transfer:** Depends on client bandwidth
- **Metadata check:** < 100ms

### Cache Hit Rate (Expected)
- **First day of semester:** ~5-10% (many new reports)
- **Mid semester:** ~60-80% (repeated access)
- **End semester:** ~90-95% (final reports cached)

## Cache Invalidation Strategies

### Automatic Invalidation Triggers

1. **Student Journal Update**
   ```typescript
   onJournalUpdate(async (journal) => {
     await services.cacheManager.invalidateStudent(journal.studentId);
     await services.cacheManager.invalidateSemester(
       getCurrentSemester(),
       getCurrentTahunAjaran()
     );
   });
   ```

2. **Meeting Log Update**
   ```typescript
   onMeetingUpdate(async (meeting) => {
     await services.cacheManager.invalidateStudent(meeting.studentId);
   });
   ```

3. **Student Data Change**
   ```typescript
   onStudentUpdate(async (student) => {
     await services.cacheManager.invalidateStudent(student.id);
   });
   ```

### Manual Invalidation

Admin dashboard endpoint:
```typescript
POST /api/admin/cache/invalidate
{
  "scope": "all" | "semester" | "student",
  "semester"?: "Ganjil",
  "tahunAjaran"?: "2024/2025",
  "studentId"?: "123"
}
```

## Error Handling

### Timeout Protection
```typescript
// PDF generation timeout after 120s
try {
  const buffer = await generator.generate(component, {
    timeout: 120000
  });
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout gracefully
    return { error: 'PDF generation took too long' };
  }
}
```

### R2 Unavailable
```typescript
// Graceful degradation
const env = getCloudflareEnv();

if (!env?.STORAGE) {
  console.warn('R2 not available, using direct generation');
  // Fall back to direct generation
}
```

### Cache Corruption
```typescript
// Automatic retry on corrupted cache
try {
  const cached = await cacheManager.get(params);
  if (!cached || !isValidPDF(cached.content)) {
    throw new Error('Corrupted cache');
  }
} catch (error) {
  // Invalidate and regenerate
  await cacheManager.invalidate(params);
  return await generator.generate(component);
}
```

## Monitoring & Observability

### Metrics to Track

1. **Cache Hit Rate**
   ```typescript
   const stats = await services.cacheManager.getStats();
   console.log(`Cache hit rate: ${stats.hitRate}%`);
   ```

2. **Generation Time**
   ```typescript
   console.log(`Generation time: ${result.metadata.generationTimeMs}ms`);
   ```

3. **Response Headers**
   ```
   X-From-Cache: true/false
   X-Generation-Time: 2345ms / cached
   X-PDF-Size: 18180
   ```

### Logging

```typescript
// Production logging
console.log('[PDF Cache]', {
  action: 'hit',
  cacheKey: 'semester_Ganjil_2024-2025',
  size: 18180,
  timestamp: new Date().toISOString()
});
```

## SOLID Principles Applied

1. **Single Responsibility**
   - R2Storage: Only R2 operations
   - CacheManager: Only caching logic
   - Generator: Only PDF generation
   - ReportService: Only orchestration

2. **Open/Closed**
   - Extend caching strategies without modifying core
   - Add new invalidation rules via events

3. **Liskov Substitution**
   - Mock R2 storage for testing
   - Swap generator implementations

4. **Interface Segregation**
   - Separate interfaces for generation, caching, storage
   - No forced implementation of unused methods

5. **Dependency Inversion**
   - High-level ReportService doesn't depend on low-level R2
   - Abstractions via TypeScript interfaces

## Testing

### Unit Tests
```bash
bun test lib/services/
```

### Integration Tests
```bash
bun run test-pdf-gen.ts
```

### Load Testing
```bash
# Simulate 20 concurrent users
npm run load-test -- --users 20 --duration 60s
```

## Deployment Checklist

- [ ] R2 bucket created: `guru-wali-storage`
- [ ] Wrangler binding configured
- [ ] Environment variables set
- [ ] Cache invalidation hooks deployed
- [ ] Monitoring dashboard configured
- [ ] Error alerting enabled

## Future Enhancements

1. **Background Job Queue**
   - Pre-generate reports during off-peak hours
   - Batch processing for multiple reports

2. **CDN Integration**
   - Serve cached PDFs via Cloudflare CDN
   - Geographic distribution

3. **Compression**
   - Compress PDFs before storage
   - Reduce storage costs

4. **Versioning**
   - Keep multiple versions of reports
   - Audit trail for principal review

## Support

For issues or questions:
- Check logs in Cloudflare Dashboard
- Review R2 bucket statistics
- Contact: dev-team@school.edu
