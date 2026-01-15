import axiosClient from './axiosClient';

class UploadsApi {
  // Upload project requirement PDF
  async uploadProjectRequirement(projectId: number, formData: FormData) {
    const response = await axiosClient.post(`/uploads/project/${projectId}/requirement`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Handle response wrapper from backend
    return response.data.data ?? response.data;
  }

  // Upload product image
  async uploadProductImage(productId: number, formData: FormData) {
    const response = await axiosClient.post(`/uploads/product/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Handle response wrapper from backend
    return response.data.data ?? response.data;
  }
}

export default new UploadsApi();