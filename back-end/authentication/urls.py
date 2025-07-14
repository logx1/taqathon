from django.urls import path
from .views import login, signup,new_access_token,logout, get_user_statistics,update_status,update_user,users_list
from .views import delete_user

urlpatterns = [
    path('login/', login, name='token_obtain_pair'),
    path('signup/', signup, name='signup'),
    path('new-access-token/', new_access_token, name='new_access_token'),
    path('logout/', logout, name='logout'),
    path('user-statistics/', get_user_statistics, name='get_user_statistics'),
    path('update-status/' ,update_status, name='update_status'),
    path('users/<int:id>', update_user, name='update_user'),
    path('delete_user/<int:id>', delete_user, name='delete_user'),
    path('users/', users_list, name='get_all_users_statistics'),
]