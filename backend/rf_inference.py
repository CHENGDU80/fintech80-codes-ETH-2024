import pandas as pd
import joblib

def predict_rf_model(input_csv_path, similarity_results):
    
    # Load the model
    model_path = 'models/rf_model_version2.joblib'  # Change this path if needed
    clf = joblib.load(model_path)

    # Load new data
    new_data = pd.read_csv(input_csv_path)

    # Ensure that the new data does not include the target column (if present)
    if 'Crush' in new_data.columns:
        new_data = new_data.drop(columns=['Crush'])

    # Make predictions
    predictions = clf.predict(new_data)

    # Get the confidence scores for the predictions
    confidences = clf.predict_proba(new_data)
    max_confidences = confidences.max(axis=1)  # Get the maximum confidence for each prediction

    # Combine predictions, confidences, and similarity results into a JSON-like dictionary
    output_data = {
        "pre_results": predictions.tolist(),
        "confidences": max_confidences.tolist(),  # Confidence scores for each prediction
        "similarity": similarity_results
    }

    return output_data