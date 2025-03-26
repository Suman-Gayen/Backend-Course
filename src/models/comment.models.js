import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //pagination plugin for mongoose schema

const commentSchema = new Schema({
  content: {
    type: String,
    require: true,
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
},
{
    timestamps: true
});

commentSchema.plugin(mongooseAggregatePaginate);      //pagination plugin for mongoose schema 


export const Comment = mongoose.model("Comment", commentSchema)