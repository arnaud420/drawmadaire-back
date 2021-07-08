type ApiSuccess = {
  success: boolean;
  data: any;
}

type ApiError = {
  success: boolean;
  error: any;
}

export const createApiResponse = async (logic: any): Promise<ApiSuccess|ApiError> => {
  try {
    const data = await logic()
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
