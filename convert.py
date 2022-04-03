from PIL import Image, ImageOps

offset = [-1, 0]

# Use values from file
with open("coords.txt", "r") as f:
	offset = [int(val) for val in f.readlines()[0].split(",")]
	print(offset)


im = Image.open("TU.png")
print(im.mode)
W = 2000
H = 1000
out = Image.new(im.mode, size=(2000, 1000))
out.paste(im, offset)

template = Image.new(im.mode, size=(2000 * 3, 1000 * 3))
for i in range(W):
	for j in range(H):
		template.putpixel((i*3 + 1, j*3 + 1), out.getpixel((i,j)))

template.save("TU_template.png")
print("DONE")