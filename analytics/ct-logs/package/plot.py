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

def data_package_plot(completed_send_phase, about_to_send_packet, success_sent, success_received):
    #requires 4 dataframe with the given logs exclusively
    # if hourly data needed,'min' should be changed to 'h'
    data = (completed_send_phase, about_to_send_packet, success_sent, success_received)
    stages = ["send phase complete", "about to send", "successfully sent","successfully received"]
    to_plot = []
    for k in range(len(data)):
        a = pd.to_datetime(data[k]['node_time'])
        df = a.groupby(a.dt.floor('min')).size().reset_index(name='count')
        df["stage"] = stages[k]
        to_plot.append(df)

    result = pd.concat(to_plot)
    
    fig = px.line(result, x="node_time", y="count", color="stage", title='Packets sent and received per minute, ct_node:' + str(instance_id))
    fig.show()



def tick_time(df):
    df["time_diff"] = (pd.to_datetime(df['node_time'])).diff()
    df['time_diff'][0] = df['time_diff'][1]
    df['time_diff2'] = df['time_diff'].apply(lambda x: x.total_seconds())
    df = df.sort_values(by=['time_diff2'], ascending=True)
    
    cut_labels_15 = ['10.1-10.2', '10.2-10.3', '10.3-10.4', '10.4-10.5', '10.5-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60+']
    cut_bins = [10.100, 10.200, 10.300, 10.400, 10.500, 15.000, 20.000, 25.000, 30.000, 35.000, 40.000, 45.000, 50.000, 55.000, 60.000, 200000]
    df['bins_h'] = pd.cut(df['time_diff2'], bins=cut_bins, labels=cut_labels_15)
    
    by_hour = pd.to_datetime(df['node_time'])
    df_time = by_hour.groupby(by_hour.dt.floor('h')).size().reset_index(name='count')
    
    
    fig1 = px.histogram(df, x="bins_h", 
                title='Ticktime difference, inst_id:' + str(instance_id) + ", date:" + str(start_date) + "-" + str(end_date),
                   labels={'bins_h':'tick time bins (s)'}, # can specify one label per df column
                   opacity=0.8, # represent bars with log scale
                   )
    
    fig2 = px.bar(df_time, x='node_time', y='count', 
             title='Number of logs by day')
    
      
    trace1 = fig1['data'][0]
    trace2 = fig2['data'][0]

    
    fig = make_subplots(rows=1, cols=2, subplot_titles=("Ticktime difference", "Number of logs by hour"))
  
    fig.add_trace(trace1, row=1, col=1)
    fig.add_trace(trace2, row=1, col=2)
    
    fig.show()

