#!/bin/bash

# Define source and destination directories
SOURCE_DIR="_courses"
#DEST_DIRS=("_courses_test")
DEST_DIRS=("_courses_sd" "_courses_wl" "_courses_seattle" "_coursescn")


# Function to update front matter
update_layout() {
    local file="$1"
    sed -i.bak '1,/^---/s/^layout:[ ]*course_detail/layout: locationcoursedetail/' "$file"
    rm -f "${file}.bak"
}

# Main synchronization function
sync_courses() {
    local total_changes=0

    for dest_dir in "${DEST_DIRS[@]}"; do
        echo "Syncing $SOURCE_DIR to $dest_dir"
        
        # Remove all files in the destination directory
        rm -rf "$dest_dir"
        
        # Recreate the destination directory
        mkdir -p "$dest_dir"
        
        # Copy files from source to destination based on directory name
        if [[ "$dest_dir" == *"cn"* ]]; then
            echo "Copying Chinese courses"
            cp -R "$SOURCE_DIR"/cn/* "$dest_dir/"
        else
            echo "Copying non-Chinese courses"
            cp -R "$SOURCE_DIR"/* "$dest_dir/"
            rm -rf "$dest_dir/cn"
        fi
        
        # Update layout in markdown files
        local changes=0

        while IFS= read -r -d '' file; do
            echo "Processing file: $file"
            if grep -q "^layout:[ ]*course_detail" "$file"; then
                update_layout "$file"
                echo "Updated layout in $(basename "$file")"
                ((changes++))
            else
                echo "No layout change needed in $(basename "$file")"
            fi
        done < <(find "$dest_dir" -name "*.md" -type f -print0)

        total_changes=$((total_changes + changes))
        echo "Changes in $dest_dir: $changes"
    done

    echo "Sync completed"
    echo "Total layout changes: $total_changes"
}

# Run the synchronization
sync_courses