import pandas as pd
import numpy as np

df_female = pd.read_csv('data\Copy of Mouse_Data_Student_Copy.xlsx - Fem Act.csv')
df_male = pd.read_csv('data\Copy of Mouse_Data_Student_Copy.xlsx - Male Act.csv')

df_female = df_female.set_index('time')
df_male = df_male.set_index('time')
df_female.index = df_female.index / 60
df_male.index = df_male.index / 60

female_hourly = df_female.groupby(df_female.index.astype(int)).mean().mean(axis=1)
male_hourly = df_male.groupby(df_male.index.astype(int)).mean().mean(axis=1)

