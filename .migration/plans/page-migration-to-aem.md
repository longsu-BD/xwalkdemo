# BD "Our Company" Page Migration to AEM — Plan

Migrate `https://www.bd.com/en-us/about-bd/our-company` into AEM Edge Delivery Services, discover other similar pages across bd.com, and build a reusable page template so the whole group can be migrated consistently.

> ⚠️ **Execution is blocked by Plan mode.** The plan is approved and ready to run, but every step below requires write/command operations (creating `migration-work/`, running the classify pipeline, generating blocks, importing content). These are disabled in Plan mode. **Please switch the session to Execute mode** (Shift+Tab cycles the mode, or accept via the plan-approval prompt). As soon as Execute mode is active, I'll run the full pipeline start to finish without further prompts, pausing only if the crawl surfaces multiple distinct templates to choose from.

## Scope & Inputs

- **Source page:** `https://www.bd.com/en-us/about-bd/our-company`
- **Scope:** This page **plus similar pages**, discovered from bd.com (sitemap/crawl) and grouped into a reusable template.
- **Target:** This EDS (aem-boilerplate-xwalk) project. No block catalog present → block code is generated per-page.

## Approach (site-migration pipeline)

1. **Project setup** — detect project type from `fstab.yaml`, configure the block library endpoint.
2. **Identify templates** — crawl bd.com, cluster pages similar to "Our Company," write `page-templates.json`; confirm the target template if more than one emerges.
3. **Page analysis** — sections, default content vs. blocks, and named block variants.
4. **Block generation** — generate code for any new block variants (one at a time).
5. **Block mapping** — add DOM selectors to the template.
6. **Import infrastructure** — parsers + transformers (+ DM/Scene7 handling if BD uses Dynamic Media).
7. **Content import** — run the bundled import script → `content/*.plain.html`.
8. **Hand off to design migration** (separate, user-initiated step).

## Checklist

- [ ] **Switch to Execute mode** (required before anything below can run)
- [ ] Project setup — create `.migration/project.json`
- [ ] Discover bd.com URLs and cluster pages similar to "Our Company"
- [ ] Confirm the template to migrate (if multiple are found)
- [ ] Page analysis — sections, blocks, and block variants
- [ ] Generate code for any new block variants
- [ ] Block mapping — DOM selectors onto the template
- [ ] Generate import infrastructure (parsers, transformers; DM/Scene7 if present)
- [ ] Run the content import for the "Our Company" template
- [ ] Verify imported content structure in preview
- [ ] Extend the import to the remaining similar pages using the template
- [ ] Hand off to design migration

## Notes & Risks

- **Bot protection:** bd.com may block scraping; the pipeline includes an automatic Bright Data fallback.
- **Dynamic Media:** if BD serves Scene7/DM imagery, extra infrastructure steps (client-side auto-block + `aem.js` dispatcher) will be applied automatically.
- **Template count:** discovery may reveal more than one distinct template — I'll confirm groupings before bulk import.

*This plan was produced in Plan mode. To carry out the migration, switch to Execute mode — then I proceed automatically.*
