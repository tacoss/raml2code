package org.gex.client.v1;
import retrofit.http.*;
import retrofit.client.Response;
import java.util.List;
import java.util.Map;

import rx.Observable;
import retrofit.mime.TypedFile;
import com.pojos.v1.*;


public interface GatitosAPI {

  @GET("/v1/cats")
  Observable<Cats> getGatitosAndSearchBy(
      @Query("searchBy") String searchBy);

  @GET("/v1/cats")
  Observable<Cats> getGatitos();

  @POST("/v1/cats")
  Observable<Cat> postGatitos(
      @Body Cat cat);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndClientSecretAndOrderByAndFilterBy(
      @Path("catId") String catId,
      @Query("clientSecret") String clientSecret,
      @Query("orderBy") String orderBy,
      @Query("filterBy") String filterBy);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndOrderByAndFilterBy(
      @Path("catId") String catId,
      @Query("orderBy") String orderBy,
      @Query("filterBy") String filterBy);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndClientSecretAndFilterBy(
      @Path("catId") String catId,
      @Query("clientSecret") String clientSecret,
      @Query("filterBy") String filterBy);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndFilterBy(
      @Path("catId") String catId,
      @Query("filterBy") String filterBy);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndClientSecretAndOrderBy(
      @Path("catId") String catId,
      @Query("clientSecret") String clientSecret,
      @Query("orderBy") String orderBy);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndOrderBy(
      @Path("catId") String catId,
      @Query("orderBy") String orderBy);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoByIdAndClientSecret(
      @Path("catId") String catId,
      @Query("clientSecret") String clientSecret);

  @GET("/v1/cats/{catId}")
  Observable<Cat> getGatitoById(
      @Path("catId") String catId);

  @PUT("/v1/cats/{catId}")
  Observable<Cat> putGatitoById(
      @Path("catId") String catId,
      @Body Cat cat);

  @GET("/v1/cats/{catId}/mapping")
  Observable<Cat> getSingleContentTypeMapping(
      @Path("catId") String catId);

  @POST("/v1/cats/{catId}/picture")
  @Multipart
  Observable<Cat> postGatitoByIdPicture(
      @Path("catId") String catId,
      @Part("file") TypedFile file);

  @POST("/v1/cats/{catId}/webFormCat")
  @FormUrlEncoded
  Observable<Cat> postGatitopByIdForm(
      @Path("catId") String catId,
      @Field("name") String name);

  @GET("/v1/settings/{key}")
  Observable<Map> getSettings(
      @Path("key") String key);

  @POST("/v1/settings/{key}")
  Observable<Map> postSettings(
      @Path("key") String key,
      @Body Map genericmap);

  @PUT("/v1/settings/{key}")
  Observable<List> putSettings(
      @Path("key") String key,
      @Body List genericarray);

  @DELETE("/v1/settings/{key}")
  @Headers({"Content-type: application/json"})
  Observable<Response> deleteSettings(
      @Path("key") String key);

  @POST("/v1/arrayprimitives")
  Observable<List<String>> postArrayPrimitives(
      @Body List<String> genericarray);

}
