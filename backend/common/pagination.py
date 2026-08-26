from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 48

    def get_paginated_response(self, data):
        return Response({"success": True, "data": data, "pagination": {"count": self.page.paginator.count,
            "page": self.page.number, "pages": self.page.paginator.num_pages,
            "next": self.get_next_link(), "previous": self.get_previous_link()}})

