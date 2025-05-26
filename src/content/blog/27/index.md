---
title: "Modern iOS Development with Swift"
summary: "Learn advanced Swift concepts, patterns, and best practices for building robust iOS applications"
date: "2025, 05, 20"
draft: false
tags:
  - Swift
---

# Modern iOS Development with Swift

Swift is a powerful and intuitive programming language for iOS development. This guide covers advanced concepts, patterns, and best practices for building robust iOS applications.

## Project Setup

### 1. Creating a New Project

```swift
// Package.swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MyApp",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "MyApp",
            targets: ["MyApp"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
        .package(url: "https://github.com/ReactiveX/RxSwift.git", from: "6.6.0"),
        .package(url: "https://github.com/SDWebImage/SDWebImage.git", from: "5.18.0"),
        .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "MyApp",
            dependencies: [
                "Alamofire",
                "RxSwift",
                "SDWebImage",
                "Kingfisher"
            ]
        ),
        .testTarget(
            name: "MyAppTests",
            dependencies: ["MyApp"]
        )
    ]
)
```

### 2. Project Structure

```
MyApp/
├── Sources/
│   ├── MyApp/
│   │   ├── App/
│   │   │   ├── AppDelegate.swift
│   │   │   └── SceneDelegate.swift
│   │   ├── Core/
│   │   │   ├── Extensions/
│   │   │   ├── Protocols/
│   │   │   └── Utils/
│   │   ├── Features/
│   │   │   ├── Auth/
│   │   │   ├── Home/
│   │   │   └── Profile/
│   │   ├── Network/
│   │   │   ├── APIClient.swift
│   │   │   └── Endpoints.swift
│   │   ├── Storage/
│   │   │   ├── CoreDataManager.swift
│   │   │   └── UserDefaultsManager.swift
│   │   └── UI/
│   │       ├── Components/
│   │       ├── Screens/
│   │       └── Theme/
│   └── Resources/
│       ├── Assets.xcassets/
│       └── Localizable.strings
└── Tests/
    └── MyAppTests/
        ├── Features/
        ├── Network/
        └── Storage/
```

## Core Features

### 1. Dependency Injection

```swift
// Sources/MyApp/Core/DI/Container.swift
final class Container {
    static let shared = Container()

    private init() {}

    private var dependencies: [String: Any] = [:]

    func register<T>(_ type: T.Type, instance: Any) {
        let key = String(describing: type)
        dependencies[key] = instance
    }

    func resolve<T>(_ type: T.Type) -> T? {
        let key = String(describing: type)
        return dependencies[key] as? T
    }
}

// Sources/MyApp/Network/APIClient.swift
protocol APIClientProtocol {
    func request<T: Decodable>(_ endpoint: Endpoint) -> Single<T>
}

final class APIClient: APIClientProtocol {
    private let session: Session

    init(session: Session = .default) {
        self.session = session
    }

    func request<T: Decodable>(_ endpoint: Endpoint) -> Single<T> {
        return Single.create { [weak self] observer in
            guard let self = self else {
                observer(.failure(APIError.unknown))
                return Disposables.create()
            }

            let request = self.session.request(
                endpoint.url,
                method: endpoint.method,
                parameters: endpoint.parameters,
                encoding: endpoint.encoding,
                headers: endpoint.headers
            )

            request.responseDecodable(of: T.self) { response in
                switch response.result {
                case .success(let value):
                    observer(.success(value))
                case .failure(let error):
                    observer(.failure(error))
                }
            }

            return Disposables.create {
                request.cancel()
            }
        }
    }
}
```

### 2. Repository Pattern

```swift
// Sources/MyApp/Features/Home/Repository/PostRepository.swift
protocol PostRepositoryProtocol {
    func getPosts() -> Single<[Post]>
    func getPost(id: String) -> Single<Post>
    func createPost(_ post: Post) -> Single<Post>
    func updatePost(_ post: Post) -> Single<Post>
    func deletePost(id: String) -> Single<Void>
}

final class PostRepository: PostRepositoryProtocol {
    private let apiClient: APIClientProtocol
    private let storage: CoreDataManager

    init(apiClient: APIClientProtocol, storage: CoreDataManager) {
        self.apiClient = apiClient
        self.storage = storage
    }

    func getPosts() -> Single<[Post]> {
        return apiClient.request(Endpoint.posts)
            .do(onSuccess: { [weak self] posts in
                self?.storage.save(posts)
            })
            .catch { [weak self] error in
                guard let self = self else { throw error }
                return self.storage.fetch(Post.self)
            }
    }

    func getPost(id: String) -> Single<Post> {
        return apiClient.request(Endpoint.post(id: id))
            .do(onSuccess: { [weak self] post in
                self?.storage.save([post])
            })
            .catch { [weak self] error in
                guard let self = self else { throw error }
                return self.storage.fetch(Post.self, id: id)
            }
    }

    func createPost(_ post: Post) -> Single<Post> {
        return apiClient.request(Endpoint.createPost(post))
            .do(onSuccess: { [weak self] post in
                self?.storage.save([post])
            })
    }

    func updatePost(_ post: Post) -> Single<Post> {
        return apiClient.request(Endpoint.updatePost(post))
            .do(onSuccess: { [weak self] post in
                self?.storage.save([post])
            })
    }

    func deletePost(id: String) -> Single<Void> {
        return apiClient.request(Endpoint.deletePost(id: id))
            .do(onSuccess: { [weak self] _ in
                self?.storage.delete(Post.self, id: id)
            })
    }
}
```

## UI Layer

### 1. SwiftUI Views

```swift
// Sources/MyApp/Features/Home/Views/PostListView.swift
struct PostListView: View {
    @StateObject private var viewModel: PostListViewModel

    init(viewModel: PostListViewModel = PostListViewModel()) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }

    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.posts) { post in
                    PostRowView(post: post)
                        .onTapGesture {
                            viewModel.selectPost(post)
                        }
                }
            }
            .navigationTitle("Posts")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: viewModel.createPost) {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }
}

// Sources/MyApp/Features/Home/Views/PostRowView.swift
struct PostRowView: View {
    let post: Post

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(post.title)
                .font(.headline)

            Text(post.body)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)

            HStack {
                Text(post.author)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text(post.date.formatted())
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}
```

### 2. ViewModel

```swift
// Sources/MyApp/Features/Home/ViewModel/PostListViewModel.swift
@MainActor
final class PostListViewModel: ObservableObject {
    @Published private(set) var posts: [Post] = []
    @Published var showError = false
    @Published var errorMessage = ""

    private let repository: PostRepositoryProtocol

    init(repository: PostRepositoryProtocol = Container.shared.resolve(PostRepositoryProtocol.self)!) {
        self.repository = repository
    }

    func refresh() async {
        do {
            posts = try await repository.getPosts().value
        } catch {
            showError = true
            errorMessage = error.localizedDescription
        }
    }

    func selectPost(_ post: Post) {
        // Handle post selection
    }

    func createPost() {
        // Handle post creation
    }
}
```

## Data Layer

### 1. Core Data

```swift
// Sources/MyApp/Storage/CoreDataManager.swift
final class CoreDataManager {
    static let shared = CoreDataManager()

    private let container: NSPersistentContainer

    private init() {
        container = NSPersistentContainer(name: "MyApp")
        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Failed to load Core Data stack: \(error)")
            }
        }
    }

    var context: NSManagedObjectContext {
        container.viewContext
    }

    func save<T: NSManagedObject>(_ objects: [T]) {
        objects.forEach { object in
            context.insert(object)
        }

        do {
            try context.save()
        } catch {
            print("Failed to save context: \(error)")
        }
    }

    func fetch<T: NSManagedObject>(_ type: T.Type, id: String? = nil) -> Single<[T]> {
        return Single.create { [weak self] observer in
            guard let self = self else {
                observer(.failure(CoreDataError.unknown))
                return Disposables.create()
            }

            let request = NSFetchRequest<T>(entityName: String(describing: type))
            if let id = id {
                request.predicate = NSPredicate(format: "id == %@", id)
            }

            do {
                let results = try self.context.fetch(request)
                observer(.success(results))
            } catch {
                observer(.failure(error))
            }

            return Disposables.create()
        }
    }

    func delete<T: NSManagedObject>(_ type: T.Type, id: String) {
        let request = NSFetchRequest<T>(entityName: String(describing: type))
        request.predicate = NSPredicate(format: "id == %@", id)

        do {
            let results = try context.fetch(request)
            results.forEach { context.delete($0) }
            try context.save()
        } catch {
            print("Failed to delete object: \(error)")
        }
    }
}
```

### 2. Network Layer

```swift
// Sources/MyApp/Network/Endpoint.swift
enum Endpoint {
    case posts
    case post(id: String)
    case createPost(Post)
    case updatePost(Post)
    case deletePost(id: String)

    var url: URL {
        var components = URLComponents()
        components.scheme = "https"
        components.host = "api.example.com"
        components.path = path
        return components.url!
    }

    private var path: String {
        switch self {
        case .posts:
            return "/posts"
        case .post(let id):
            return "/posts/\(id)"
        case .createPost:
            return "/posts"
        case .updatePost(let post):
            return "/posts/\(post.id)"
        case .deletePost(let id):
            return "/posts/\(id)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .posts, .post:
            return .get
        case .createPost:
            return .post
        case .updatePost:
            return .put
        case .deletePost:
            return .delete
        }
    }

    var parameters: Parameters? {
        switch self {
        case .createPost(let post), .updatePost(let post):
            return try? post.asDictionary()
        default:
            return nil
        }
    }

    var encoding: ParameterEncoding {
        switch self {
        case .posts, .post, .deletePost:
            return URLEncoding.default
        case .createPost, .updatePost:
            return JSONEncoding.default
        }
    }

    var headers: HTTPHeaders {
        return ["Content-Type": "application/json"]
    }
}
```

## Testing

### 1. Unit Tests

```swift
// Tests/MyAppTests/Features/Home/ViewModel/PostListViewModelTests.swift
final class PostListViewModelTests: XCTestCase {
    var sut: PostListViewModel!
    var mockRepository: MockPostRepository!

    override func setUp() {
        super.setUp()
        mockRepository = MockPostRepository()
        sut = PostListViewModel(repository: mockRepository)
    }

    override func tearDown() {
        sut = nil
        mockRepository = nil
        super.tearDown()
    }

    func test_refresh_success() async {
        // Given
        let posts = [Post(id: "1", title: "Test", body: "Test", author: "Test", date: Date())]
        mockRepository.mockPosts = posts

        // When
        await sut.refresh()

        // Then
        XCTAssertEqual(sut.posts, posts)
        XCTAssertFalse(sut.showError)
    }

    func test_refresh_failure() async {
        // Given
        mockRepository.shouldFail = true

        // When
        await sut.refresh()

        // Then
        XCTAssertTrue(sut.posts.isEmpty)
        XCTAssertTrue(sut.showError)
        XCTAssertFalse(sut.errorMessage.isEmpty)
    }
}
```

### 2. UI Tests

```swift
// Tests/MyAppTests/Features/Home/Views/PostListViewTests.swift
final class PostListViewTests: XCTestCase {
    var sut: PostListView!
    var mockViewModel: MockPostListViewModel!

    override func setUp() {
        super.setUp()
        mockViewModel = MockPostListViewModel()
        sut = PostListView(viewModel: mockViewModel)
    }

    override func tearDown() {
        sut = nil
        mockViewModel = nil
        super.tearDown()
    }

    func test_view_displays_posts() {
        // Given
        let posts = [Post(id: "1", title: "Test", body: "Test", author: "Test", date: Date())]
        mockViewModel.posts = posts

        // When
        let view = sut.body

        // Then
        XCTAssertNotNil(view)
    }

    func test_view_handles_error() {
        // Given
        mockViewModel.showError = true
        mockViewModel.errorMessage = "Test Error"

        // When
        let view = sut.body

        // Then
        XCTAssertNotNil(view)
    }
}
```

## Best Practices

### 1. Code Organization

- Follow MVVM architecture
- Use dependency injection
- Implement proper error handling
- Write clean and maintainable code
- Follow consistent naming conventions

### 2. Performance

- Use async/await for concurrency
- Implement proper caching
- Optimize Core Data queries
- Monitor memory usage
- Profile your app regularly

## Conclusion

Swift offers:

- Modern language features
- Great tooling support
- Strong type safety
- Excellent performance
- Rich ecosystem

Remember to:

- Follow best practices
- Write tests
- Optimize performance
- Handle memory management
- Keep learning and improving

Happy Swift development!
