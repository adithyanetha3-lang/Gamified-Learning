# Streamlit analytics scaffold for demo and academic presentation.
import streamlit as st
import pandas as pd

st.set_page_config(page_title="SkillPark Analytics", layout="wide")
st.title("SkillPark Analytics Dashboard")
st.caption("Simple performance visualization for rural education project presentation")

sample_students = pd.DataFrame([
    {"Name": "Asha Kumari", "XP": 180, "Level": 2, "Streak": 6, "Accuracy": 78},
    {"Name": "Ravi Verma", "XP": 240, "Level": 3, "Streak": 9, "Accuracy": 84},
    {"Name": "Meena Devi", "XP": 150, "Level": 2, "Streak": 4, "Accuracy": 71},
])

col1, col2, col3 = st.columns(3)
col1.metric("Students", len(sample_students))
col2.metric("Average XP", int(sample_students["XP"].mean()))
col3.metric("Average Accuracy", f"{int(sample_students['Accuracy'].mean())}%")

st.subheader("Student Performance Table")
st.dataframe(sample_students, use_container_width=True)

st.subheader("XP by Student")
st.bar_chart(sample_students.set_index("Name")["XP"])

st.subheader("Accuracy by Student")
st.bar_chart(sample_students.set_index("Name")["Accuracy"])
