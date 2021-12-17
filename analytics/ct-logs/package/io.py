import os
import pandas as pd

def get_file_path(folder, file_name):
    """
    Build an absolute file path from a relevant file path

    :param folder: The relevant file path
    :param file_name: File name to be appended to the file path
    :return: returns the path string
    """
    file_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(file_dir, folder + file_name)
    return file_path

def save_csv(data_frame, folder, file_name):
    """
    Save a data frame to the csv file

    :param data_frame: Data frame to be saved
    :param folder: The relevant file path
    :param file_name: File name to be appended to the file path
    """
    file_path = get_file_path(folder, file_name)
    data_frame.to_csv(file_path, header=True, index=False)

def read_csv(folder, file_name):
    """
    Read a data frame to the csv file

    :param folder: The relevant file path
    :param file_name: File name to be appended to the file path
    :return: returns the data frame
    """
    file_path = get_file_path(folder, file_name)
    return pd.read_csv(file_path)

def open_file(folder, file_name):
    """
    Return a editable file object

    :param folder: The relevant file path
    :param file_name: File name to be appended to the file path
    :return: returns file object
    """
    file_path = get_file_path(folder, file_name)
    f = open(file_path, "w+")
    return f
