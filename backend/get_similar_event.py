import pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def get_similar_event(test_file_path):
    # Load the train and test datasets
    train_file_path = 'train_version2.csv'
    train_df = pd.read_csv(train_file_path)
    # Assuming df is your DataFrame
    train_df = train_df[train_df['Crush'] != 0]
    test_df = pd.read_csv(test_file_path)

    # Define the categorical and numerical columns based on the dataset
    numerical_cols = ['Posted Speed Limit (MPH)', 'Mileage', 'Usage_year', 'Speed', 'Disengagement']
    categorical_cols = ['Autonomy_level', 'Roadway Type', 'Roadway Surface', 'Lighting', 'Weather', 'Acceleration']

    # Clean up the numerical columns by converting to numeric and filling or dropping invalid values
    for col in numerical_cols:
        train_df[col] = pd.to_numeric(train_df[col], errors='coerce')
        test_df[col] = pd.to_numeric(test_df[col], errors='coerce')
        # Fill missing values with the median of the column in the train dataset
        median_value = train_df[col].median()
        train_df[col].fillna(median_value, inplace=True)
        test_df[col].fillna(median_value, inplace=True)

    # Create preprocessing pipeline for numerical and categorical data
    preprocessing_pipeline = ColumnTransformer(transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

    # Fit the preprocessor on the training dataset and transform both datasets
    train_features = train_df.drop(columns=['ID'])
    test_features = test_df.drop(columns=['ID'])

    preprocessed_train = preprocessing_pipeline.fit_transform(train_features)
    preprocessed_test = preprocessing_pipeline.transform(test_features)

    # Convert sparse matrices to dense format (if applicable)
    preprocessed_train_dense = preprocessed_train.toarray() if hasattr(preprocessed_train, "toarray") else preprocessed_train
    preprocessed_test_dense = preprocessed_test.toarray() if hasattr(preprocessed_test, "toarray") else preprocessed_test

    # Calculate cosine similarity for each test row with all training rows
    top3_similarities = {}
    for i, test_row in enumerate(preprocessed_test_dense):
        # Compute cosine similarity between the current test row and all training rows
        similarity_scores = cosine_similarity([test_row], preprocessed_train_dense)[0]
        # Get the indices of the top 3 most similar rows in the training dataset
        top3_indices = np.argsort(-similarity_scores)[:3]
        # Get the IDs of the top 3 similar rows
        top3_ids = train_df.iloc[top3_indices]['ID'].values.tolist()
        # Add the result to the dictionary with test ID as the key
        test_id = test_df.iloc[i]['ID']
        top3_similarities[test_id] = top3_ids

    return top3_similarities

