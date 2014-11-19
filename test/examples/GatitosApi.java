package org.gex.client;
import retrofit.http.Body;
import retrofit.http.Path;
import retrofit.http.DELETE;
import retrofit.http.GET;
import retrofit.http.POST;
import retrofit.http.PUT;
import java.util.List;

import rx.Observable;
import com.pojos.*;


public interface GatitosAPI {

  @GET("/cats")
  public Observable<Cats> getGatitos(@Query("search") String search);

  @POST("/cats")
  public Observable<Cat> postGatitos(@Body Cat cat);

  @GET("/cats/{catId}")
  public Observable<Cat> getGatitoById(@Path("catId") String catId, @Query("filterBy") String filterBy);

  @PUT("/cats/{catId}")
  public Observable<Cat> putGatitoById(@Path("catId") String catId, @Body Cat cat);

}
