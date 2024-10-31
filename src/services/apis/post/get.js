import axios from "../../../shared/apiClient";

export const getPost = async (postId) => {
  try {
    const response = await axios.get(`posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  try {
    const response = await axios.get("posts");
    return response.data;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
};

export const getCourseAllPosts = async (courseId) => {
  try {
    const response = await axios.get(`posts/${courseId}/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
};

export const getUserCourseFreePosts = async () => {
  try {
    const response = await axios.get(`posts/users/me/courses/freePosts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};

export const getUserCourseNotifications = async () => {
  try {
    const response = await axios.get(`posts/users/me/courses/notification`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};
