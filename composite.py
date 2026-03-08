import cv2
import numpy as np
from PIL import Image

# 1. Load images
print("Loading images...")
garden = Image.open('image copy.png').convert("RGBA")
try:
    house = Image.open('house_nobg.png').convert("RGBA")
except FileNotFoundError:
    from rembg import remove
    print("Removing background from house...")
    h = Image.open('image.png')
    house = remove(h)
    house.save('house_nobg.png')

# 2. Basic Inpainting to cover the woman
# We use numpy array for easier slicing
garden_np = np.array(garden)
# The woman is roughly at x: 200 to 450, y: 250 to 1050
# We copy a patch from the right side of the fence
patch = garden_np[250:1100, 1000:1250].copy()
# Paste over the woman
garden_np[250:1100, 200:450] = patch
garden = Image.fromarray(garden_np)

# 3. Resize house
# Plank is ~3 meters. Let's make the house ~750 pixels high.
scale = 750 / house.height
new_w = int(house.width * scale)
new_h = int(house.height * scale)
house_resized = house.resize((new_w, new_h), Image.Resampling.LANCZOS)

# 4. Composite
# Place house roughly over the gravel pit
# Let's parameterize the position so we can adjust it later
x_offset = 120
y_offset = 320

garden.paste(house_resized, (x_offset, y_offset), house_resized)

# 5. Save output
garden.convert("RGB").save("result.jpg", quality=95)
print("Saved to result.jpg")
