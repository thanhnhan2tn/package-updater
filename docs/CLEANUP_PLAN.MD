# Cleanup Plan

## I. Clean up packages.json

1. Identify unused and missing packages:

   ```bash
   npx depcheck
   ```

2. Remove all unused dependencies and devDependencies from `package.json` as reported by `depcheck`.

3. Synchronize lockfile:

   ```bash
   yarn install
   ```

4. Start development server to reveal resolution errors:

   ```bash
   yarn start
   ```

## II. Clean up UI components

1. Scan for orphaned UI components:

   ```bash
   grep -RL "components/ui/" src/ | grep "src/components/ui/.*\\.tsx"
   ```

2. Remove unused `input-otp.tsx`:

    ```bash
    rm src/components/ui/input-otp.tsx
    ```

3. List all UI component files:

    ```bash
    ls src/components/ui
    ```

4. Bulk remove unused UI files:

    ```bash
    rm <source-directory>
    ```

5. Rescan pages and components imports for remaining UI files:

    ```bash
    for f in src/components/ui/*.tsx; do n=$(basename "$f" .tsx); if grep -R "components/ui/$n" -q src/pages src/components; then :; else echo "$f"; fi; done
    ```

6. Remove additional unused UI files:

    ```bash
    rm src/components/ui/dialog.tsx src/components/ui/label.tsx ...
    ```

7. Restore `toaster.tsx` due to usage in `App.tsx`:
    * Re-created `toaster.tsx` with correct content.

8. Final confirmation scan:

    ```bash
    for file in src/components/ui/*.tsx src/components/ui/*/*.tsx; do name=$(basename "$file"); grep -R "components/ui/${name%%.*}" -n src || echo "unused: ${name}"; done
    ```

## Next Actions

* Run full test suite and verify build integrity.
* Update CI workflows to reflect updated dependencies.
* Periodically re-run `depcheck` to catch further unused packages.
