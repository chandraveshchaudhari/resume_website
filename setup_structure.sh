se structure
declare -a dirs=(
  "src/app/education"
  "src/app/experience"
  "src/app/projects"
  "src/app/research"
  "src/app/contact"
  "src/components"
  "src/config"
  "src/styles"
)

declare -a files=(
  "src/app/layout.tsx"
  "src/app/page.tsx"
  "src/app/education/page.tsx"
  "src/app/experience/page.tsx"
  "src/app/projects/page.tsx"
  "src/app/research/page.tsx"
  "src/app/contact/page.tsx"
  "src/components/Navbar.tsx"
  "src/components/Footer.tsx"
  "src/components/Hero.tsx"
  "src/components/SectionTitle.tsx"
  "src/config/config.js"
  "src/styles/globals.css"
)

# Create directories if they don't exist
echo "📁 Creating directories..."
for dir in "${dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo "  ✅ Created: $dir"
  else
    echo "  ⏭️  Skipped (already exists): $dir"
  fi
done

# Create files if they don't exist
echo ""
echo "📝 Creating files..."
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    touch "$file"
    echo "  ✅ Created: $file"
  else
    echo "  ⏭️  Skipped (already exists): $file"
  fi
done

echo ""
echo "✨ Project structure is ready!"
