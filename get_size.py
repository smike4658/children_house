import cv2
from PIL import Image
import numpy as np

# Load images
try:
    garden = cv2.imread('image copy.png')
    house = cv2.imread('image.png')
    print("Garden size:", garden.shape)
    print("House size:", house.shape)
except Exception as e:
    print("Error:", e)
