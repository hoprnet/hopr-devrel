from colour import Color

def color_selector(color_name):
    if color_name == 'hopr_yellow':
        return '#%02x%02x%02x' % (255, 255, 160)
    elif color_name == 'hopr_dark_blue':
        return '#%02x%02x%02x' % (0, 0, 80)
    elif color_name == 'hopr_bright_blue':
        return '#%02x%02x%02x' % (0, 0, 180)
    elif color_name == 'hopr_sky_blue':
        return '#%02x%02x%02x' % (180, 240, 255)
    elif color_name == 'hopr_steel_blue':
        return '#%02x%02x%02x' % (60, 100, 165)
    else:
        return '#%02x%02x%02x' % (25, 114, 120)