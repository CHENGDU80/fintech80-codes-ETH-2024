import pandas as pd
import joblib
from tensorflow.keras.models import load_model

def predict_mlp_model(input_csv_path, similarity_results):
    """
    This function takes an input CSV file path, uses a pre-trained MLP model
    to make predictions, and combines the predictions with similarity results into a JSON-like dictionary structure.
    
    Parameters:
    - input_csv_path (str): Path to the input CSV file for making predictions.
    - similarity_results (dict): Similarity results to include in the final output.
    
    Returns:
    - output_data (dict): A dictionary containing predictions and similarity results.
    """
    # Load the preprocessor
    preprocessor_path = 'models/mlp_preprocessor.joblib'
    preprocessor = joblib.load(preprocessor_path)

    # Load new data
    new_data = pd.read_csv(input_csv_path)

    # Ensure that the new data does not include the target column (if present)
    if 'Crush' in new_data.columns:
        new_data = new_data.drop(columns=['Crush'])

    # Preprocess the new data
    new_data_processed = preprocessor.transform(new_data)

    # Load the trained model
    model_path = 'models/mlp_model_version2.h5'
    model = load_model(model_path)

    # Make predictions
    predictions = model.predict(new_data_processed).flatten()
    
    # Determine the class predictions and confidence scores
    if model.output_shape[-1] == 1:
        # Binary classification case
        predictions_class = (predictions > 0.5).astype(int)
        confidences = predictions  # Since predictions are between 0 and 1, they represent the confidence
    else:
        # Multi-class classification case
        predictions_class = predictions.argmax(axis=1)
        confidences = predictions.max(axis=1)  # Highest probability in each row as the confidence

    # Combine predictions, confidences, and similarity results into a JSON-like dictionary
    output_data = {
        "pre_results": predictions_class.tolist(),
        "confidences": confidences.tolist(),  # Confidence scores for each prediction
        "similarity": similarity_results
    }

    return output_data