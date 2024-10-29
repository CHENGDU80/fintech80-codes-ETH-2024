import pandas as pd
import joblib
import numpy as np

def predict_svm_model(input_csv_path, similarity_results):
    """
    This function takes an input CSV file path, uses a pre-trained SVM model
    to make predictions, and combines the predictions with similarity results into a JSON-like dictionary structure.
    
    Parameters:
    - input_csv_path (str): Path to the input CSV file for making predictions.
    - similarity_results (dict): Similarity results to include in the final output.
    
    Returns:
    - output_data (dict): A dictionary containing predictions and similarity results.
    """
    # Load the model
    model_path = 'models/svm_model_version2.joblib'  # Change this path if needed
    clf = joblib.load(model_path)

    # Load new data
    new_data = pd.read_csv(input_csv_path)

    # Ensure that the new data does not include the target column (if present)
    if 'Crush' in new_data.columns:
        new_data = new_data.drop(columns=['Crush'])

    # Make predictions
    predictions = clf.predict(new_data)

    # Get the confidence scores using the decision_function method
    decision_scores = clf.decision_function(new_data)

    # For binary classification, convert the signed distance to a probability-like confidence
    if len(clf.classes_) == 2:
        confidences = (1 / (1 + np.exp(-decision_scores)))  # Applying sigmoid to get probability-like scores
    else:
        confidences = np.max(np.abs(decision_scores), axis=1)  # Max confidence for multi-class classification

    # Combine predictions, confidences, and similarity results into a JSON-like dictionary
    output_data = {
        "pre_results": predictions.tolist(),
        "confidences": confidences.tolist(),  # Confidence scores for each prediction
        "similarity": similarity_results
    }

    return output_data