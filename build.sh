#!/bin/bash
# Build domecek.html from template + src modules
# Usage: ./build.sh

set -e
cd "$(dirname "$0")"

OUTPUT="domecek.html"

# Module order matters — dependencies must come first
MODULES=(
  src/config.js
  src/setup.js
  src/environment.js
  src/materials.js
  src/helpers.js
  src/ground.js
  src/footings.js
  src/posts.js
  src/beams.js
  src/floors.js
  src/walls.js
  src/roof.js
  src/railing.js
  src/slide.js
  src/ladder.js
  src/labels.js
  src/dimensions.js
  src/views.js
  src/controls.js
  src/ui.js
  src/picker.js
  src/postprocessing.js
  src/main.js
)

# Concatenate: template header + all modules + template footer
cat template.html > "$OUTPUT"
for mod in "${MODULES[@]}"; do
  echo "" >> "$OUTPUT"
  cat "$mod" >> "$OUTPUT"
done
echo "" >> "$OUTPUT"
cat template_footer.html >> "$OUTPUT"

echo "Built $OUTPUT ($(wc -l < "$OUTPUT" | tr -d ' ') lines)"
