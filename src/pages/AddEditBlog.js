import React, { useState, useEffect } from "react";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

import { db, storage } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";


const initialState = {
  title : "",
  tags: [],
  trending : "no",
  category: "",
  description: ""
}
const categoryOption = [
  "fashion",
  "Technology",
  "Food",
  "Politics",
  "Sports",
  "Business",
]

const AddEditBlog = ({user,setActive}) => {
  const navigate = useNavigate()
  const [form,setForm] = useState(initialState)
  const [file,setFile] = useState(null)
  const [progress,setProgress] = useState(null)
  const {id} = useParams()


  const {title, tags, category, trending, description} = form

  useEffect(()=>{
     const uploadFile =()=>{
      const storageRef = ref(storage,file.name)
      const uploadTask = uploadBytesResumable(storageRef,file)
      uploadTask.on("state_changed",(snapshot)=>{
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log("upload is" + progress + "% done");
        setProgress(progress)
        switch(snapshot.state){
          case "paused" : 
           console.log("Upload is paused");
           break;
          case "running":
            console.log("upload is running");
            break;
        }

      },(error)=>{
        console.log(error);
      },()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl)=>{
          toast.success("Image Uploaded Successfully")
          setForm((prev)=> ({...prev, imgUrl : downloadUrl}))
        })
      })
     }
     file && uploadFile()
  },[file])

  useEffect(()=>{
        id && getBlogDetail();
  },[id])

  const getBlogDetail = async ()=>{
    const docRef = doc(db,"blogs",id)
    const snapshot = await getDoc(docRef)

    if(snapshot.exists()){
      setForm({...snapshot.data()})
    }

    setActive(null)
  }
  const handleChange =(e)=>{
    setForm({...form,[e.target.name]: e.target.value})
  }
  const handleTags =(tags)=>{
    setForm({...form,tags})
  }
  const handleTrending =(e)=>{
    setForm({...form,trending: e.target.value})
  }
  const onCategoryChange =(e)=>{
    setForm({...form, category: e.target.value})
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
   

    if(!id){

      if(title && tags && trending && file && category && description){
        try{
          await addDoc(collection(db,"blogs"),{
            ...form,
            timestamp : serverTimestamp(),
            author: user.displayName,
            userId : user.uid
  
          })
          toast.success("blog created successfully")
          navigate("/")    
        }
        catch(err){
          console.log(err);
        }
      }
      else{
        return toast.error("please fill up the form ")
      }
    }
    else{
      if(title && tags && trending && category && description){

        try{
          await updateDoc(doc(db,"blogs",id),{
            ...form,
            timestamp : serverTimestamp(),
            author: user.displayName,
            userId : user.uid
  
          })
          toast.success("blog updated successfully")
          navigate("/")    
        }
        catch(err){
          console.log(err);
        }
      }

    }
  }
  

  return (
   <div className="container-fluid mb-4">
    <div className="container">
      <div className="col-12">
        <div className="text-center heading py-2">
    {id ? "Update Blog" : "Create Blog"}
        </div>

      </div>
      <div className="row h-100 justify-content-center align-items-center">
        <div className="col-10 col-md-8 col-lg-6">
          <form className="row blog-form" onSubmit={handleSubmit}>
            <div className="col-12 py-3">
              <input type="text"
              className="form-control input-text-box"
              placeholder="Title"
              name="title"
              value={title}
              onChange={handleChange} />
            </div>
            <div className="col-12 py-3">
             <ReactTagInput tags={tags} placeholder="tags" onChange={handleTags}/>
            </div>
            <div className="col-12 py-3">
               <p className="trending">
                Is it trending blog?

               </p>
               <div className="form-check-inline mx-2">
                <input type="radio"
                className="form-check-input"
                value="yes"
                name="radioOption"
                checked={trending ==="yes"} 
                  onChange={handleTrending}
                />
                <label htmlFor="radioOption" className="form-check-label">Yes&nbsp;</label>

                <input type="radio"
                className="form-check-input"
                value="no"
                name="radioOption"
                checked={trending ==="no"} 
                  onChange={handleTrending}
                />
                <label htmlFor="radioOption" className="form-check-label">No&nbsp;</label>
               </div>
            </div>
            <div className="col-12 py-3">
              <select value={category}
              onChange={onCategoryChange}
              className="catg-dropdown">
                <option >please select category</option>
                {categoryOption.map((option,index)=>(
                  <option value={option || ""} key={index}>{option}</option>
                ))}
              </select>
            </div>
            <div className="col-12 py-3">
              <textarea className="form-control description-box"
                placeholder="Description"
                value={description}
                name="description"
                onChange={handleChange}

              />
            </div>
            <div className="mb-3">
              <input type="file" 
              className="form-control"
              onChange={(e)=>{setFile(e.target.files[0])}} />
            </div>
            <div className="col-12 py-3 text-center">
              <button className="btn btn-add" type="Submit" disabled={progress!== null && progress <100}>{id ? "Update" : "Submit"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
   </div>
  )
}

export default AddEditBlog