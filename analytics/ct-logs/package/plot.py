import matplotlib.pyplot as plt
from .color import *
from .io import *
# from matplotlib.ticker import FuncFormatter

def plot_bar(df, col1, col2, file_name, color_name):
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.bar(df[col1], df[col2], color=color_selector(color_name), lw=4)
    ax.set_xlabel(col1)
    ax.set_ylabel(col2, color=color_selector(color_name))
    plt.xticks(rotation= 80)

    #xfmt = DateFormatter('%Y-%m-%d %H:%M:%S')
    #ax.xaxis.set_major_formatter(xfmt)
    plt.savefig(give_file_path('../plot/', file_name))
    plt.show()