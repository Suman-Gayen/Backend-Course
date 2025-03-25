import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //pagination plugin for mongoose schema 

const videoSchema = new Schema(
    {
        videoFiles: {
            type: String, // cloudnary url
            requird: true
        },
        thumbnail: {
            type: String, // cloudnary url
            requird: true
        },
        title: {
            type: String,
            requird: true
        },
        desc: {
            type: String,
            requird: true
        },
        duration: {
            type: Number, 
            requird: true   
        },
        views: {
            type: String,
            default: 0
        },
        isPublish: {
            type: Boolean, 
            default: 0
        },
        owner: {
            type: Schema.Types.ObjectId, 
            ref: "owner"
        },


    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);      //pagination plugin for mongoose schema 

export const Video = mongoose.model("Video", videoSchema)