import matplotlib.pyplot as plt
from .color import *
from .io import *
import plotly.io as pio
import plotly.express as px

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
    plt.show()


def restart_time(df):
    # subdataframe for plotting "restart" and "passive" status
    restart = pd.DataFrame(df['time_diff2'][0::2]).reset_index(drop=True)
    passive = pd.DataFrame(df['time_diff2'][1::2]).reset_index(drop=True)
    node_time = pd.DataFrame(df['new_node_time'][1::2]).reset_index(drop=True)
    restart_t = pd.concat([restart, passive, node_time], axis=1)
    restart_t.columns = ['restart', 'passive', 'node_time']
    
    return restart_t

def restart_time_plot(df, col1, col2, title_plt, file_name): 
    fig = px.scatter(df, x=df[col1], y=df[col2], title=title_plt)
    pio.write_image(fig, give_file_path('../plot/', file_name + '.png'))
    fig.show()


def data_by_hour(df):
    p = pd.to_datetime(df['node_time'])
    df4 = p.groupby(p.dt.floor('h')).size().reset_index(name='count')
    
    fig = px.bar(df4, x='node_time', y='count')
    fig.show()