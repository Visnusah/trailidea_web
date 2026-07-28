import app from "./src/app";
import { PORT as API_PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

connectToMongoDB();

app.listen(
    API_PORT,
    "0.0.0.0",
    () => {
        console.log(`Server running on http://0.0.0.0:${API_PORT}`);
    }
);
