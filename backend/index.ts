import app from "./src/app";
import { PORT as API_PORT } from "./src/configs/constant";
import { connectToMongoDB } from "./src/database/mongodb";

connectToMongoDB();

app.listen(
    API_PORT,  // start backend in this PORT
    () => {
        console.log(`Server: http://localhost:${API_PORT}`); // backtick
    }
);
