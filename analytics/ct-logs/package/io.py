import os
import pandas as pd
from .constants import Constants

def get_file_path(folder, file_name):
    """
    Build an absolute file path from a relevant file path

    :param folder: The relevant file path
    :param file_name: File name to be appended to the file path
    :return: returns the path string
    """
    return os.path.join(Constants.FILE_DIRECTORY, folder + file_name)

def if_file_exist(folder, file_name):
    file_path = get_file_path(folder, file_name)
    if_exist = os.path.isfile(file_path)
    if not if_exist:
        print('Files {} does not exist'.format(file_path))
    return if_exist

def save_csv(data_frame, folder, file_name, contains_header=True, is_append=False):
    """
    Save a data frame to the csv file

    :param data_frame: Data frame to be saved
    :param folder: The relevant file path
    :param file_name: File name to be appended to the file path
    """
    folder_path = os.path.join(Constants.FILE_DIRECTORY, folder)
    file_path = get_file_path(folder, file_name)
    # check if folder exists, if not create one
    if not os.path.exists(folder_path):
        os.mkdir(folder_path)
    if is_append:
        data_frame.to_csv(file_path, mode='a', header=contains_header, index=False)
    else:
        data_frame.to_csv(file_path, header=contains_header, index=False)

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
