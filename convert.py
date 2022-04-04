from PIL import Image, ImageOps

offset = [-1, 0]

# Use values from file
with open("coords_new.txt", "r") as f:
	offset = [int(val) for val in f.readlines()[0].split(",")]
	print("Offset:")
	print(offset)



im = Image.open("TU.png")
if im.mode != "RGBA": 
	print("NOT RGBA IMAGE!!")


COLOR_MAP = {
        "#6D001A": 0,  # darkest red
        "#BE0039": 1,  # dark red
        "#FF4500": 2,  # red
        "#FFA800": 3,  # orange
        "#FFD635": 4,  # yellow
        "#FFF8B8": 5,  # pale yellow
        "#00A368": 6,  # dark green
        "#00CC78": 7,  # green
        "#7EED56": 8,  # light green
        "#00756F": 9,  # dark teal
        "#009EAA": 10,  # teal
        "#00CC00": 11,  # light teal
        "#2450A4": 12,  # dark blue
        "#3690EA": 13,  # blue
        "#51E9F4": 14,  # light blue
        "#493AC1": 15,  # indigo
        "#6A5CFF": 16,  # periwinkle
        "#94B3FF": 17,  # lavender
        "#811E9F": 18,  # dark purple
        "#B44AC0": 19,  # purple
        "#E4ABFF": 20,  # pale purple
        "#DE107F": 21,  # magenta
        "#FF3881": 22,  # pink
        "#FF99AA": 23,  # light pink
        "#6D482F": 24,  # dark brown
        "#9C6926": 25,  # brown
        "#FFB470": 26,  # beige
        "#000000": 27,  # black
        "#515252": 28,  # dark gray
        "#898D90": 29,  # gray
        "#D4D7D9": 30,  # light gray
        "#FFFFFF": 31,  # white
    }



W = 2000
H = 1000
out = Image.new(im.mode, size=(2000, 1000))
out.paste(im, offset)
ERROR = False
template = Image.new("RGBA", size=(2000 * 3, 1000 * 3))
for i in range(W):
	for j in range(H):
		pixel = out.getpixel((i,j))

		hexcode = "#" + "".join(f"{val:02X}" for val in pixel[0:3])
		if hexcode not in COLOR_MAP:
			print(f"Error: PIXEL {i-offset[0]},{j-offset[1]} has invalid color {hexcode}")
			ERROR = True
		template.putpixel((i*3 + 1, j*3 + 1), pixel)



if not ERROR:
	template.save("TU_template.png")
	print("DONE")
else:
	print("Not exporting, fix file")